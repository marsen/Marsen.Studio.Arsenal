"use client";

import { useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import Block from "@/presentation/components/layouts/Block";
import { toPdfPoint } from "./coordinates";
import { embedSignatures, getPdfPageCount, renderPageToCanvas } from "./pdf";
import PlacementBox from "./PlacementBox";
import SignaturePad from "./SignaturePad";
import { getServerSnapshot, getSnapshot, subscribe } from "./storage";
import type { PageSizePt, SignaturePlacement } from "./types";

/** 渲染縮放比例；畫面上的簽名位置（像素）都是在這個縮放下記錄的。 */
const SCALE = 1.5;
const DEFAULT_PLACEMENT_WIDTH = 160;
const DEFAULT_PLACEMENT_HEIGHT = 60;

function downloadBytes(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes.slice()], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PdfSigner() {
  const t = useTranslations("pdfSigner");
  const signature = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // canvas 一律掛載（用 CSS 隱藏，不做條件渲染），確保上傳當下 canvasRef 就已經可用，
  // 不用額外的 useEffect 去等待 canvas 掛載完成。
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageSizes, setPageSizes] = useState<Map<number, PageSizePt>>(new Map());
  const [placements, setPlacements] = useState<SignaturePlacement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  const currentPageSize = pageSizes.get(currentPageIndex) ?? null;
  const currentPlacements = placements.filter((p) => p.pageIndex === currentPageIndex);

  async function renderPage(bytes: Uint8Array, pageIndex: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = await renderPageToCanvas(bytes, pageIndex, canvas, SCALE);
    setPageSizes((prev) => new Map(prev).set(pageIndex, size));
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    if (file.type !== "application/pdf") {
      setError(t("errFormat"));
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const count = await getPdfPageCount(bytes);

      setPdfBytes(bytes);
      setFileName(file.name);
      setPageCount(count);
      setPageSizes(new Map());
      setPlacements([]);
      setCurrentPageIndex(0);
      await renderPage(bytes, 0);
    } catch {
      setError(t("errFormat"));
    }
  }

  async function goToPage(pageIndex: number) {
    if (!pdfBytes || pageIndex < 0 || pageIndex >= pageCount) return;
    setCurrentPageIndex(pageIndex);
    await renderPage(pdfBytes, pageIndex);
  }

  function addPlacement() {
    if (!signature) return;
    const canvas = canvasRef.current;
    const centerX = canvas ? Math.max((canvas.width - DEFAULT_PLACEMENT_WIDTH) / 2, 0) : 40;
    const centerY = canvas ? Math.max((canvas.height - DEFAULT_PLACEMENT_HEIGHT) / 2, 0) : 40;

    const next: SignaturePlacement = {
      id: crypto.randomUUID(),
      pageIndex: currentPageIndex,
      xPx: centerX,
      yPx: centerY,
      widthPx: DEFAULT_PLACEMENT_WIDTH,
      heightPx: DEFAULT_PLACEMENT_HEIGHT,
      signatureDataUrl: signature,
    };
    setPlacements((prev) => [...prev, next]);
  }

  function updatePlacement(next: SignaturePlacement) {
    setPlacements((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  }

  function removePlacement(id: string) {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleDownload() {
    if (!pdfBytes || placements.length === 0) return;
    setSigning(true);
    setError(null);
    try {
      const imageBytesCache = new Map<string, Uint8Array>();
      async function getImageBytes(dataUrl: string): Promise<Uint8Array> {
        const cached = imageBytesCache.get(dataUrl);
        if (cached) return cached;
        const response = await fetch(dataUrl);
        const bytes = new Uint8Array(await response.arrayBuffer());
        imageBytesCache.set(dataUrl, bytes);
        return bytes;
      }

      const embeds = [];
      for (const placement of placements) {
        const pageSize = pageSizes.get(placement.pageIndex);
        if (!pageSize) continue;
        const pt = toPdfPoint(placement, pageSize, SCALE);
        const imageBytes = await getImageBytes(placement.signatureDataUrl);
        embeds.push({ pageIndex: placement.pageIndex, ...pt, imageBytes });
      }

      const signedBytes = await embedSignatures(pdfBytes, embeds);
      downloadBytes(signedBytes, fileName ? `signed-${fileName}` : "signed.pdf");
    } catch {
      setError(t("errSign"));
    } finally {
      setSigning(false);
    }
  }

  return (
    <Block tone="ink" compact className="min-h-screen">
      <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="mb-8 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-foreground">{t("signatureStep")}</p>
        <SignaturePad />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={handleFileChange}
      />

      {!pdfBytes && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => event.key === "Enter" && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-16 text-center transition hover:border-foreground/40 hover:bg-card"
        >
          <span className="mb-2 text-4xl">📄</span>
          <span className="font-medium text-foreground">{t("upload")}</span>
          <span className="mt-1 text-xs text-muted-foreground">{t("uploadHint")}</span>
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <div className={pdfBytes ? "mt-6" : "hidden"}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPageIndex - 1)}
              disabled={currentPageIndex <= 0}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-card disabled:opacity-40"
            >
              ‹
            </button>
            <span className="text-sm text-muted-foreground">
              {t("pageIndicator", { current: currentPageIndex + 1, total: pageCount })}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPageIndex + 1)}
              disabled={currentPageIndex >= pageCount - 1}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-card disabled:opacity-40"
            >
              ›
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-card"
          >
            {t("changeFile")}
          </button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">{signature ? t("placeHint") : t("needSignatureHint")}</p>

        <div className="mb-4">
          <button
            type="button"
            onClick={addPlacement}
            disabled={!signature}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-80 disabled:opacity-40"
          >
            {t("addPlacement")}
          </button>
        </div>

        <div className="relative inline-block max-w-full overflow-auto rounded-lg border border-border">
          <canvas ref={canvasRef} />
          {currentPageSize &&
            currentPlacements.map((placement) => (
              <PlacementBox
                key={placement.id}
                placement={placement}
                onChange={updatePlacement}
                onRemove={() => removePlacement(placement.id)}
              />
            ))}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleDownload}
            disabled={placements.length === 0 || signing}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-80 disabled:opacity-40"
          >
            {signing ? t("signing") : t("downloadSigned")}
          </button>
        </div>
      </div>
      </div>
    </Block>
  );
}
