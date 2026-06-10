"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

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

type ConversionState =
  | { status: "idle" }
  | { status: "converting"; fileName: string }
  | { status: "preview"; blob: Blob; previewUrl: string; fileName: string }
  | { status: "error"; errorKey: ErrorKey };

const ACCEPTED_MIME = [
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
];
const ACCEPTED_EXT = [".heic", ".heif"];
const MAX_SIZE_BYTES = 30 * 1024 * 1024;

export function validateFile(file: File): ErrorKey | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  const mimeOk = ACCEPTED_MIME.includes(file.type);
  const extOk = ACCEPTED_EXT.includes(ext);
  if (!mimeOk && !extOk) return "errFormat";
  if (file.size > MAX_SIZE_BYTES) return "errSize";
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
  const t = useTranslations("heic");
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
      console.error("[HeicConverter] conversion failed:", err);
      if (ignoreRef.current) return;
      setState({ status: "error", errorKey: "errConvert" });
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
    const errorKey = validateFile(file);
    if (errorKey) {
      setState({ status: "error", errorKey });
      return;
    }
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
    const errorKey = validateFile(file);
    if (errorKey) {
      setState({ status: "error", errorKey });
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
      <h1 className="mb-2 text-2xl font-bold">{t("title")}</h1>
      <p className="mb-8 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-foreground">{t("quality")}</p>
        <div className="flex gap-2">
          {QUALITY_KEYS.map((q) => (
            <button
              key={q}
              onClick={() => setSelectedQuality(q)}
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

      {(state.status === "idle" || state.status === "error") && (
        <label
          htmlFor={inputId}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-16 text-center transition hover:border-foreground/40 hover:bg-card"
        >
          <span className="mb-2 text-4xl">📁</span>
          <span className="font-medium text-foreground">{t("upload")}</span>
          <span className="mt-1 text-xs text-muted-foreground">{t("uploadHint")}</span>
          <input
            id={inputId}
            type="file"
            accept=".heic,.heif,image/heic,image/heif"
            className="sr-only"
            onChange={handleInputChange}
          />
        </label>
      )}

      {state.status === "error" && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t(state.errorKey)}
        </p>
      )}

      {switchNotice && (
        <p className="mb-4 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          {t("switching")}
        </p>
      )}

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
          <span>{t("converting")}</span>
        </div>
      )}

      {state.status === "preview" && (
        <div className="mt-4">
          <img
            src={state.previewUrl}
            alt={t("previewAlt")}
            className="mb-4 max-h-96 w-full rounded-lg object-contain"
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(state.blob, state.fileName)}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-80"
            >
              {t("downloadJpg")}
            </button>
            <label
              htmlFor={inputId}
              className="cursor-pointer rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-card"
            >
              {t("another")}
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
