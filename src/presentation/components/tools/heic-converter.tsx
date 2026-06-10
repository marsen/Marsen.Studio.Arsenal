"use client";

import { useEffect, useRef, useState } from "react";

import { heicToJpegBlob } from "@/presentation/lib/heic";

export type Quality = "high" | "balance" | "compress";

export const QUALITY_VALUES: Record<Quality, number> = {
  high: 0.92,
  balance: 0.75,
  compress: 0.5,
};

const QUALITY_LABELS: Record<Quality, string> = {
  high: "高品質",
  balance: "平衡",
  compress: "壓縮",
};

type ConversionState =
  | { status: "idle" }
  | { status: "converting"; fileName: string }
  | { status: "preview"; blob: Blob; previewUrl: string; fileName: string }
  | { status: "error"; message: string };

const ACCEPTED_MIME = [
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
];
const ACCEPTED_EXT = [".heic", ".heif"];
const MAX_SIZE_BYTES = 30 * 1024 * 1024;

export function validateFile(file: File): string | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  const mimeOk = ACCEPTED_MIME.includes(file.type);
  const extOk = ACCEPTED_EXT.includes(ext);
  if (!mimeOk && !extOk) return "請上傳 HEIC 格式的檔案";
  if (file.size > MAX_SIZE_BYTES) return "檔案大小不可超過 30MB";
  return null;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
  a.click();
  URL.revokeObjectURL(url);
}

export default function HeicConverter() {
  const [state, setState] = useState<ConversionState>({ status: "idle" });
  const [selectedQuality, setSelectedQuality] = useState<Quality>("high");
  const [switchNotice, setSwitchNotice] = useState(false);
  const ignoreRef = useRef(false);
  const prevPreviewUrl = useRef<string | null>(null);
  const fileRef = useRef<File | null>(null);

  function revokePreview() {
    if (prevPreviewUrl.current) {
      URL.revokeObjectURL(prevPreviewUrl.current);
      prevPreviewUrl.current = null;
    }
  }

  async function handleFile(file: File, quality: Quality = selectedQuality) {
    ignoreRef.current = false;
    revokePreview();
    fileRef.current = file;
    setState({ status: "converting", fileName: file.name });

    try {
      const blob = await heicToJpegBlob(file, QUALITY_VALUES[quality]);
      if (ignoreRef.current) return;
      const previewUrl = URL.createObjectURL(blob);
      prevPreviewUrl.current = previewUrl;
      setState({ status: "preview", blob, previewUrl, fileName: file.name });
    } catch (err) {
      console.error("[HeicConverter] 轉換失敗:", err);
      if (ignoreRef.current) return;
      const message =
        err instanceof Error
          ? err.message
          : "轉換失敗，請確認為有效的 HEIC 格式";
      setState({ status: "error", message });
    }
  }

  // T011: 品質切換時若已有預覽，自動重轉
  useEffect(() => {
    if (state.status === "preview" && fileRef.current) {
      handleFile(fileRef.current, selectedQuality);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuality]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const error = validateFile(file);
    if (error) {
      setState({ status: "error", message: error });
      return;
    }
    // 若轉換中，設 ignore flag 並提示切換
    if (state.status === "converting") {
      ignoreRef.current = true;
      setSwitchNotice(true);
      setTimeout(() => setSwitchNotice(false), 2000);
    }
    handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      setState({ status: "error", message: error });
      return;
    }
    if (state.status === "converting") {
      ignoreRef.current = true;
      setSwitchNotice(true);
      setTimeout(() => setSwitchNotice(false), 2000);
    }
    handleFile(file);
  }

  const inputId = "heic-file-input";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">HEIC 轉 JPG</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        在瀏覽器本地完成轉換，檔案不會上傳至任何伺服器
      </p>

      {/* T009: 品質選擇器（永遠顯示） */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-foreground">輸出品質</p>
        <div className="flex gap-2">
          {(["high", "balance", "compress"] as Quality[]).map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuality(q)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                selectedQuality === q
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-card"
              }`}
            >
              {QUALITY_LABELS[q]}
            </button>
          ))}
        </div>
      </div>

      {/* 上傳區（idle / error 時顯示） */}
      {(state.status === "idle" || state.status === "error") && (
        <label
          htmlFor={inputId}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-16 text-center transition hover:border-foreground/40 hover:bg-card"
        >
          <span className="mb-2 text-4xl">📁</span>
          <span className="font-medium text-foreground">點擊選擇或拖拉 HEIC 檔案</span>
          <span className="mt-1 text-xs text-muted-foreground">支援 .heic / .heif，最大 30MB</span>
          <input
            id={inputId}
            type="file"
            accept=".heic,.heif,image/heic,image/heif"
            className="sr-only"
            onChange={handleInputChange}
          />
        </label>
      )}

      {/* 錯誤訊息 */}
      {state.status === "error" && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      )}

      {/* 切換新檔案提示 */}
      {switchNotice && (
        <p className="mb-4 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          已切換至新檔案
        </p>
      )}

      {/* 轉換中 */}
      {state.status === "converting" && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <svg
            className="mb-4 h-8 w-8 animate-spin text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>轉換中…</span>
        </div>
      )}

      {/* 預覽 */}
      {state.status === "preview" && (
        <div className="mt-4">
          <img
            src={state.previewUrl}
            alt="轉換結果預覽"
            className="mb-4 max-h-96 w-full rounded-lg object-contain"
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(state.blob, state.fileName)}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-80"
            >
              下載 JPG
            </button>
            <label
              htmlFor={inputId}
              className="cursor-pointer rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-card"
            >
              換一張
              <input
                id={inputId}
                type="file"
                accept=".heic,.heif,image/heic,image/heif"
                className="sr-only"
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>
      )}
    </main>
  );
}
