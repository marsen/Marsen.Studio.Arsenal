"use client";

import { useRef, type PointerEvent } from "react";
import type { SignaturePlacement } from "./types";

const MIN_SIZE = 24;

type Props = {
  placement: SignaturePlacement;
  onChange: (next: SignaturePlacement) => void;
  onRemove: () => void;
};

/** 畫布上單一個可拖曳、可縮放、可移除的簽名位置方框。 */
export default function PlacementBox({ placement, onChange, onRemove }: Props) {
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; originWidth: number; originHeight: number } | null>(
    null,
  );

  function handleDragPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, originX: placement.xPx, originY: placement.yPx };
  }

  function handleDragPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    onChange({ ...placement, xPx: dragRef.current.originX + dx, yPx: dragRef.current.originY + dy });
  }

  function handleDragPointerUp() {
    dragRef.current = null;
  }

  function handleResizePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originWidth: placement.widthPx,
      originHeight: placement.heightPx,
    };
  }

  function handleResizePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!resizeRef.current) return;
    event.stopPropagation();
    const dx = event.clientX - resizeRef.current.startX;
    const dy = event.clientY - resizeRef.current.startY;
    onChange({
      ...placement,
      widthPx: Math.max(MIN_SIZE, resizeRef.current.originWidth + dx),
      heightPx: Math.max(MIN_SIZE, resizeRef.current.originHeight + dy),
    });
  }

  function handleResizePointerUp(event: PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    resizeRef.current = null;
  }

  return (
    <div
      onPointerDown={handleDragPointerDown}
      onPointerMove={handleDragPointerMove}
      onPointerUp={handleDragPointerUp}
      className="absolute cursor-move touch-none border-2 border-primary/70 bg-primary/5"
      style={{ left: placement.xPx, top: placement.yPx, width: placement.widthPx, height: placement.heightPx }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 使用者自己的簽名 dataURL，非遠端圖片 */}
      <img
        src={placement.signatureDataUrl}
        alt=""
        className="pointer-events-none h-full w-full object-contain"
        draggable={false}
      />
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onRemove}
        className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-white"
      >
        ×
      </button>
      <div
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        className="absolute -right-1.5 -bottom-1.5 h-4 w-4 cursor-se-resize touch-none rounded-full border-2 border-white bg-primary"
      />
    </div>
  );
}
