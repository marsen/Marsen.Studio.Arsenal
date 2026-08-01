"use client";

import { useRef, useState, useSyncExternalStore, type ChangeEvent, type PointerEvent } from "react";
import { useTranslations } from "next-intl";
import { addSignature, getServerSnapshot, getSnapshot, removeSignature, subscribe } from "./storage";

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 160;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

type Props = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

/** 簽名庫：可陸續畫/上傳多份簽名並保留，讓使用者在放置簽名位置前選擇要用哪一份。 */
export default function SignaturePad({ selectedId, onSelect }: Props) {
  const t = useTranslations("pdfSigner");
  const signatures = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
    const saved = addSignature(canvas.toDataURL("image/png"));
    onSelect(saved.id);
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
      const saved = addSignature(reader.result as string);
      onSelect(saved.id);
    };
    reader.readAsDataURL(file);
  }

  function handleRemove(id: string) {
    removeSignature(id);
    if (id === selectedId) onSelect(null);
  }

  return (
    <div className="space-y-4">
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

      {signatures.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">{t("savedSignatures")}</p>
          <div className="flex flex-wrap gap-3">
            {signatures.map((signature, index) => (
              <div key={signature.id} className="relative">
                <button
                  type="button"
                  onClick={() => onSelect(signature.id)}
                  className={`rounded-lg border-2 p-1 transition ${
                    signature.id === selectedId ? "border-primary" : "border-border hover:border-foreground/40"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- 使用者自己的簽名 dataURL，非遠端圖片 */}
                  <img
                    src={signature.dataUrl}
                    alt={t("signatureThumbAlt", { n: index + 1 })}
                    className="h-14 w-24 bg-white object-contain"
                  />
                </button>
                <button
                  type="button"
                  aria-label={t("removeSignatureAria")}
                  onClick={() => handleRemove(signature.id)}
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
