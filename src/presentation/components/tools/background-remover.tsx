"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import type { Config } from "@imgly/background-removal";
import { downloadZip } from "client-zip";

import { decodeHeicToCanvas } from "@/presentation/lib/heic";

const ACCEPTED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
];
const ACCEPTED_EXT = [".png", ".jpg", ".jpeg", ".webp", ".heic", ".heif"];
const MAX_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_FILES = 20;

type ErrorKey = "errFormat" | "errSize";

export function validateFile(file: File): ErrorKey | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  const mimeOk = ACCEPTED_MIME.includes(file.type);
  const extOk = ACCEPTED_EXT.includes(ext);
  if (!mimeOk && !extOk) return "errFormat";
  if (file.size > MAX_SIZE_BYTES) return "errSize";
  return null;
}

function isHeic(file: File): boolean {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    ext === ".heic" ||
    ext === ".heif"
  );
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("canvas export failed"))),
      "image/png",
    );
  });
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

export default function BackgroundRemover() {
  const t = useTranslations("bgRemoval");
  const [items, setItems] = useState<Item[]>([]);
  const [modelProgress, setModelProgress] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const queueRef = useRef<Item[]>([]);
  const runningRef = useRef(false);
  const cancelledRef = useRef(false);
  const itemsRef = useRef<Item[]>([]);
  useLayoutEffect(() => {
    itemsRef.current = items;
  });

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      itemsRef.current.forEach(
        (it) => it.resultUrl && URL.revokeObjectURL(it.resultUrl),
      );
    };
  }, []);

  // 頁面載入即在背景預載去背模型，讓首次上傳免等待（模型走 CDN + 快取，只下一次）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { preload } = await import("@imgly/background-removal");
        await preload({
          model: "isnet_fp16",
          device: "gpu",
          progress: (key, current, total) => {
            if (!cancelled && key.startsWith("fetch")) {
              setModelProgress(total ? current / total : null);
            }
          },
        });
      } catch (err) {
        console.error("[BackgroundRemover] preload failed:", err);
      } finally {
        if (!cancelled) setModelProgress(null);
      }
    })();
    return () => {
      cancelled = true;
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
      const { removeBackground } = await import("@imgly/background-removal");

      while (queueRef.current.length > 0) {
        const item = queueRef.current.shift()!;
        updateItem(item.id, { status: "processing" });
        try {
          let input: Blob = item.file;
          if (isHeic(item.file)) {
            const canvas = await decodeHeicToCanvas(item.file);
            input = await canvasToPngBlob(canvas);
          }

          const config: Config = {
            model: "isnet_fp16",
            device: "gpu",
            output: { format: "image/png" },
            progress: (key, current, total) => {
              if (key.startsWith("fetch")) {
                setModelProgress(total ? current / total : null);
              }
            },
          };

          const result = await removeBackground(input, config);
          const url = URL.createObjectURL(result);
          if (cancelledRef.current) {
            URL.revokeObjectURL(url);
            break;
          }
          if (!itemsRef.current.some((it) => it.id === item.id)) {
            URL.revokeObjectURL(url);
            continue;
          }
          setModelProgress(null);
          updateItem(item.id, {
            status: "done",
            resultBlob: result,
            resultUrl: url,
          });
        } catch (err) {
          console.error("[BackgroundRemover] removal failed:", err);
          updateItem(item.id, { status: "error", error: "errFormat" });
        }
      }
    } finally {
      runningRef.current = false;
      setModelProgress(null);
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setNotice(null);

    const incoming = Array.from(fileList);
    const room = MAX_FILES - itemsRef.current.length;
    if (room <= 0) {
      setNotice(t("maxReached"));
      return;
    }
    const accepted = incoming.slice(0, room);
    if (incoming.length > room) {
      setNotice(t("maxSkipped", { skipped: incoming.length - room }));
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

  function outName(file: File) {
    return file.name.replace(/\.[^.]+$/, "") + "-removed.png";
  }

  function download(item: Item) {
    if (!item.resultUrl) return;
    const a = document.createElement("a");
    a.href = item.resultUrl;
    a.download = outName(item.file);
    a.click();
  }

  async function downloadAllZip() {
    const done = items.filter((it) => it.status === "done" && it.resultBlob);
    if (done.length === 0) return;
    const blob = await downloadZip(
      done.map((it) => ({ name: outName(it.file), input: it.resultBlob! })),
    ).blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "removed-bg.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    items.forEach((it) => it.resultUrl && URL.revokeObjectURL(it.resultUrl));
    queueRef.current = [];
    setItems([]);
    setNotice(null);
  }

  const inputId = "bg-remover-input";
  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
      <p className="mb-8 text-sm text-muted-foreground">{t("subtitle")}</p>

      <label
        htmlFor={inputId}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-12 text-center transition hover:border-foreground/40 hover:bg-card"
      >
        <span className="mb-2 text-4xl">🪄</span>
        <span className="font-medium text-foreground">{t("upload")}</span>
        <span className="mt-1 text-xs text-muted-foreground">{t("uploadHint")}</span>
        <input
          id={inputId}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.heic,.heif,image/*"
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {modelProgress !== null && (
        <div className="mt-4">
          <p className="mb-1 text-xs text-muted-foreground">
            {t("modelLoading", { pct: Math.round(modelProgress * 100) })}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.round(modelProgress * 100)}%` }}
            />
          </div>
        </div>
      )}

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
                <div
                  className="flex aspect-square items-center justify-center overflow-hidden rounded-lg"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(#d4d4d4 0% 25%, #ffffff 0% 50%)",
                    backgroundSize: "16px 16px",
                  }}
                >
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
                      {item.status === "processing" ? t("processing") : t("waiting")}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-foreground" title={item.file.name}>
                  {item.file.name}
                </p>
                {item.status === "done" && (
                  <button
                    onClick={() => download(item)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-80"
                  >
                    {t("downloadPng")}
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
          <div
            className="overflow-auto rounded-lg"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#d4d4d4 0% 25%, #ffffff 0% 50%)",
              backgroundSize: "24px 24px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxUrl}
              alt=""
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
