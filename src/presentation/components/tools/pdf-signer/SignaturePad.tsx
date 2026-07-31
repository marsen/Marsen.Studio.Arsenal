"use client";

import { useRef, useState, useSyncExternalStore, type ChangeEvent, type PointerEvent } from "react";
import { useTranslations } from "next-intl";
import { getServerSnapshot, getSnapshot, saveSignature, subscribe } from "./storage";

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 160;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

export default function SignaturePad() {
  const t = useTranslations("pdfSigner");
  const signature = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getContext() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function pointerPosition(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const ctx = getContext();
    if (!ctx) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const { x, y } = pointerPosition(event);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#18181B";
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = pointerPosition(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function useDrawnSignature() {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    saveSignature(canvas.toDataURL("image/png"));
    clearCanvas();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t("errFormat"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      saveSignature(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  if (signature) {
    return (
      <div className="rounded-xl border border-border p-4">
        <p className="mb-2 text-xs text-muted-foreground">{t("currentSignature")}</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- 使用者自己的簽名 dataURL，非遠端圖片，不適用 next/image 最佳化 */}
        <img src={signature} alt={t("currentSignatureAlt")} className="mb-3 h-20 bg-white" />
        <button
          type="button"
          onClick={() => saveSignature(null)}
          className="rounded-lg border border-border px-4 py-1.5 text-sm text-foreground transition hover:bg-card"
        >
          {t("clearSignature")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="mb-2 text-xs text-muted-foreground">{t("drawHint")}</p>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="mb-3 touch-none rounded-lg border border-border bg-white"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={clearCanvas}
          className="rounded-lg border border-border px-4 py-1.5 text-sm text-foreground transition hover:bg-card"
        >
          {t("clearDraw")}
        </button>
        <button
          type="button"
          onClick={useDrawnSignature}
          disabled={!hasDrawn}
          className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-80 disabled:opacity-40"
        >
          {t("useDrawn")}
        </button>
        <span className="text-xs text-muted-foreground">{t("or")}</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-border px-4 py-1.5 text-sm text-foreground transition hover:bg-card"
        >
          {t("uploadSignature")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>
      {error && <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
