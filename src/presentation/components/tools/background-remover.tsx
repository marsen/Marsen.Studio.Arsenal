"use client";

import { useEffect, useRef, useState } from "react";

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

export function validateFile(file: File): string | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  const mimeOk = ACCEPTED_MIME.includes(file.type);
  const extOk = ACCEPTED_EXT.includes(ext);
  if (!mimeOk && !extOk) return "不支援的格式（僅限 PNG / JPG / WebP / HEIC）";
  if (file.size > MAX_SIZE_BYTES) return "檔案大小不可超過 15MB";
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
      (b) => (b ? resolve(b) : reject(new Error("HEIC 轉檔失敗"))),
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
  error?: string;
};

export default function BackgroundRemover() {
  const [items, setItems] = useState<Item[]>([]);
  const [modelProgress, setModelProgress] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const queueRef = useRef<Item[]>([]);
  const runningRef = useRef(false);
  const cancelledRef = useRef(false);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  // 卸載時釋放所有 objectURL、標記取消，避免處理中的項目完成後洩漏
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
        // 預載失敗不影響功能，首次去背時會再嘗試下載
        console.error("[BackgroundRemover] 模型預載失敗:", err);
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
      // 動態載入，避免 SSR 階段載入 WASM
      const { removeBackground } = await import("@imgly/background-removal");

      while (queueRef.current.length > 0) {
        const item = queueRef.current.shift()!;
        updateItem(item.id, { status: "processing" });
        try {
          // HEIC 先用共用模組解碼成 PNG，再餵給去背套件
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
          // 元件已卸載：釋放 url 並停止整個佇列，避免孤兒 objectURL 洩漏
          if (cancelledRef.current) {
            URL.revokeObjectURL(url);
            break;
          }
          // 該項已被「清空」移除：丟棄此結果但繼續處理佇列其餘項目
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
          console.error("[BackgroundRemover] 去背失敗:", err);
          updateItem(item.id, {
            status: "error",
            error: err instanceof Error ? err.message : "去背失敗",
          });
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
      setNotice(`一次最多處理 ${MAX_FILES} 張，請先清空再繼續`);
      return;
    }
    const accepted = incoming.slice(0, room);
    if (incoming.length > room) {
      setNotice(`一次最多處理 ${MAX_FILES} 張，超出的 ${incoming.length - room} 張已略過`);
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
    a.download = "去背結果.zip";
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
      <h1 className="mb-2 text-2xl font-bold">圖片去背</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        在瀏覽器本地批次去除背景，輸出透明 PNG，檔案不會上傳至任何伺服器。支援
        PNG / JPG / WebP / HEIC，一次最多 {MAX_FILES} 張、單張 15MB。
      </p>

      {/* 上傳區 */}
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
        <span className="font-medium text-foreground">
          點擊選擇或拖拉圖片（可多張）
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          首次使用會下載去背模型，請稍候
        </span>
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

      {/* 模型下載進度 */}
      {modelProgress !== null && (
        <div className="mt-4">
          <p className="mb-1 text-xs text-muted-foreground">
            下載去背模型中… {Math.round(modelProgress * 100)}%
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.round(modelProgress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 提示訊息 */}
      {notice && (
        <p className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          {notice}
        </p>
      )}

      {/* 結果清單 */}
      {items.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              共 {items.length} 張，已完成 {doneCount} 張
            </p>
            <div className="flex gap-2">
              {doneCount > 0 && (
                <button
                  onClick={downloadAllZip}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-80"
                >
                  打包下載 ZIP（{doneCount}）
                </button>
              )}
              <button
                onClick={clearAll}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-card"
              >
                清空
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
                      {item.error}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {item.status === "processing" ? "去背中…" : "等待中…"}
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
                    下載 PNG
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 放大檢視 lightbox */}
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
              alt="放大檢視"
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
