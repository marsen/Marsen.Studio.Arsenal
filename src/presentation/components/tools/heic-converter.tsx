"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { downloadZip } from "client-zip";

import { heicToJpegBlob } from "@/presentation/lib/heic";

export type Quality = "high" | "balance" | "compress";

export const QUALITY_VALUES: Record<Quality, number> = {
  high: 0.92,
  balance: 0.75,
  compress: 0.5,
};

const QUALITY_KEYS: Quality[] = ["high", "balance", "compress"];
const QUALITY_LABEL_KEYS = {
  high: "qualityHigh",
  balance: "qualityBalance",
  compress: "qualityCompress",
} as const;

type ErrorKey = "errFormat" | "errSize" | "errConvert";

const ACCEPTED_MIME = [
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
];
const ACCEPTED_EXT = [".heic", ".heif"];
const MAX_SIZE_BYTES = 30 * 1024 * 1024;
const MAX_FILES = 20;

export function validateFile(file: File): ErrorKey | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  const mimeOk = ACCEPTED_MIME.includes(file.type);
  const extOk = ACCEPTED_EXT.includes(ext);
  if (!mimeOk && !extOk) return "errFormat";
  if (file.size > MAX_SIZE_BYTES) return "errSize";
  return null;
}

/** 輸出檔名：換掉 .heic / .heif 副檔名為 .jpg，沒有副檔名則直接補上 */
export function jpgName(fileName: string): string {
  return /\.(heic|heif)$/i.test(fileName)
    ? fileName.replace(/\.(heic|heif)$/i, ".jpg")
    : fileName + ".jpg";
}

type ItemStatus = "pending" | "processing" | "done" | "error";

type Item = {
  id: string;
  file: File;
  status: ItemStatus;
  resultUrl?: string;
  resultBlob?: Blob;
  error?: ErrorKey;
};

/** 格式／大小錯誤重轉也不會變好，只有轉檔失敗值得跟著品質切換重試 */
function isRetryable(item: Item): boolean {
  return item.status !== "error" || item.error === "errConvert";
}

/**
 * 產生 ZIP 內的檔名，同名時補 -1、-2 後綴。
 * 檔名只由來源檔名推導，拖入兩個同名檔（例如從不同資料夾各拖一張 IMG_0001.HEIC）
 * 會產生重複 entry，解壓縮時會靜默只留一份，使用者以為下載到兩張卻少一張。
 */
export function zipEntryNames(fileNames: string[]): string[] {
  const used = new Map<string, number>();
  return fileNames.map((fileName) => {
    const base = jpgName(fileName);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return seen === 0 ? base : base.replace(/\.jpg$/, `-${seen}.jpg`);
  });
}

export default function HeicConverter() {
  const t = useTranslations("heic");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<Quality>("high");
  const [notice, setNotice] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const queueRef = useRef<Item[]>([]);
  const runningRef = useRef(false);
  const cancelledRef = useRef(false);
  const qualityRef = useRef<Quality>(selectedQuality);
  // 品質切換會讓進行中的轉換結果作廢，用世代編號辨識該丟棄哪些結果
  const generationRef = useRef(0);
  const itemsRef = useRef<Item[]>([]);
  useLayoutEffect(() => {
    itemsRef.current = items;
  });

  useEffect(() => {
    // 同一個 instance 的 effect 若被重複觸發（StrictMode），cleanup 會把旗標留在
    // true，之後所有轉換結果都會被丟棄。實測目前不會發生，但重設成本只有一行。
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      itemsRef.current.forEach(
        (it) => it.resultUrl && URL.revokeObjectURL(it.resultUrl),
      );
    };
  }, []);

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }

  async function runQueue() {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        const item = queueRef.current.shift()!;
        const gen = generationRef.current;
        updateItem(item.id, { status: "processing" });

        try {
          const blob = await heicToJpegBlob(
            item.file,
            QUALITY_VALUES[qualityRef.current],
          );
          if (cancelledRef.current) return;
          // 品質已切換或項目已被清空，這份結果作廢
          if (gen !== generationRef.current) continue;
          if (!itemsRef.current.some((it) => it.id === item.id)) continue;

          updateItem(item.id, {
            status: "done",
            resultBlob: blob,
            resultUrl: URL.createObjectURL(blob),
          });
        } catch (err) {
          console.error("[HeicConverter] conversion failed:", err);
          if (cancelledRef.current) return;
          if (gen !== generationRef.current) continue;
          updateItem(item.id, { status: "error", error: "errConvert" });
        }
      }
    } finally {
      runningRef.current = false;
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setNotice(null);

    const incoming = Array.from(fileList);
    // 被擋下的檔案（格式／大小不符）不佔用額度——它們不會進轉換佇列，
    // 不該讓使用者為了補幾張而清空已轉好的結果
    const occupied = itemsRef.current.filter(
      (it) => !(it.status === "error" && it.error !== "errConvert"),
    ).length;
    const room = MAX_FILES - occupied;
    if (room <= 0) {
      setNotice(t("maxReached", { max: MAX_FILES }));
      return;
    }
    const accepted = incoming.slice(0, room);
    if (incoming.length > room) {
      setNotice(
        t("maxSkipped", { max: MAX_FILES, skipped: incoming.length - room }),
      );
    }

    const newItems: Item[] = accepted.map((file) => {
      const error = validateFile(file);
      return error
        ? { id: crypto.randomUUID(), file, status: "error" as const, error }
        : { id: crypto.randomUUID(), file, status: "pending" as const };
    });

    setItems((prev) => [...prev, ...newItems]);
    queueRef.current.push(...newItems.filter((it) => it.status === "pending"));
    void runQueue();
  }

  /** 切換品質：整批重轉，而不是只套用到之後新加的檔案 */
  function selectQuality(quality: Quality) {
    if (quality === selectedQuality) return;
    setSelectedQuality(quality);
    qualityRef.current = quality;

    const retryable = itemsRef.current.filter(isRetryable);
    if (retryable.length === 0) return;

    generationRef.current += 1;
    // 預覽大圖若正開著，它指向的 URL 即將被 revoke，先關掉避免破圖
    setLightboxUrl(null);
    itemsRef.current.forEach(
      (it) => it.resultUrl && URL.revokeObjectURL(it.resultUrl),
    );

    const reset = itemsRef.current.map((it) =>
      isRetryable(it)
        ? {
            ...it,
            status: "pending" as const,
            resultBlob: undefined,
            resultUrl: undefined,
            error: undefined,
          }
        : it,
    );
    setItems(reset);
    queueRef.current = reset.filter((it) => it.status === "pending");
    setNotice(t("requeued", { n: retryable.length }));
    void runQueue();
  }

  function download(item: Item) {
    if (!item.resultUrl) return;
    const a = document.createElement("a");
    a.href = item.resultUrl;
    a.download = jpgName(item.file.name);
    a.click();
  }

  async function downloadAllZip() {
    const done = items.filter((it) => it.status === "done" && it.resultBlob);
    if (done.length === 0) return;
    const names = zipEntryNames(done.map((it) => it.file.name));
    const blob = await downloadZip(
      done.map((it, i) => ({ name: names[i], input: it.resultBlob! })),
    ).blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted-jpg.zip";
    a.click();
    // 20 張的 zip 可能數十 MB，同一個 task 內就 revoke 會讓部分瀏覽器取消下載
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function clearAll() {
    items.forEach((it) => it.resultUrl && URL.revokeObjectURL(it.resultUrl));
    generationRef.current += 1;
    queueRef.current = [];
    setItems([]);
    setNotice(null);
    setLightboxUrl(null);
  }

  function removeItem(id: string) {
    const target = itemsRef.current.find((it) => it.id === id);
    if (target?.resultUrl) {
      if (lightboxUrl === target.resultUrl) setLightboxUrl(null);
      URL.revokeObjectURL(target.resultUrl);
    }
    // 還沒轉到的直接從佇列拿掉；正在轉的那張 runQueue 會因為找不到項目而自行丟棄
    queueRef.current = queueRef.current.filter((it) => it.id !== id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    setNotice(null);
  }

  const inputId = "heic-file-input";
  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
      <p className="mb-8 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-foreground">{t("quality")}</p>
        <div className="flex gap-2">
          {QUALITY_KEYS.map((q) => (
            <button
              key={q}
              onClick={() => selectQuality(q)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                selectedQuality === q
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-card"
              }`}
            >
              {t(QUALITY_LABEL_KEYS[q])}
            </button>
          ))}
        </div>
      </div>

      <label
        htmlFor={inputId}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-12 text-center transition hover:border-foreground/40 hover:bg-card"
      >
        <span className="mb-2 text-4xl">📁</span>
        <span className="font-medium text-foreground">{t("upload")}</span>
        <span className="mt-1 text-xs text-muted-foreground">{t("uploadHint")}</span>
        <input
          id={inputId}
          type="file"
          multiple
          accept=".heic,.heif,image/heic,image/heif"
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {notice && (
        <p className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          {notice}
        </p>
      )}

      {items.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("count", { total: items.length, done: doneCount })}
            </p>
            <div className="flex gap-2">
              {doneCount > 0 && (
                <button
                  onClick={downloadAllZip}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-80"
                >
                  {t("downloadZip", { n: doneCount })}
                </button>
              )}
              <button
                onClick={clearAll}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-card"
              >
                {t("clearAll")}
              </button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-background">
                  {item.status === "done" && item.resultUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.resultUrl}
                      alt={item.file.name}
                      onClick={() => setLightboxUrl(item.resultUrl!)}
                      className="max-h-full max-w-full cursor-zoom-in object-contain"
                    />
                  ) : item.status === "error" ? (
                    <span className="px-2 text-center text-xs text-destructive">
                      {item.error ? t(item.error) : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {item.status === "processing" ? t("converting") : t("waiting")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <p
                    className="min-w-0 flex-1 truncate text-xs text-foreground"
                    title={item.file.name}
                  >
                    {item.file.name}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={t("remove", { name: item.file.name })}
                    title={t("remove", { name: item.file.name })}
                    className="shrink-0 rounded px-1 text-sm leading-none text-muted-foreground transition hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
                {item.status === "done" && (
                  <button
                    onClick={() => download(item)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-80"
                  >
                    {t("downloadJpg")}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          style={{ cursor: "zoom-out" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt={t("previewAlt")}
            className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
          />
        </div>
      )}
    </main>
  );
}
