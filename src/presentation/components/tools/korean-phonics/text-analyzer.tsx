"use client";

import { useState } from "react";
import { decompose, isHangulSyllable } from "@/lib/hangul/decompose";
import { CHOSEONG, JUNGSEONG, JONGSEONG } from "@/lib/hangul/data";

interface Props {
  speak: (text: string) => void;
}

export default function TextAnalyzer({ speak }: Props) {
  const [input, setInput] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const tokens = Array.from(input);

  function handleClickSyllable(char: string, index: number) {
    setActiveIndex(index);
    speak(char);
  }

  function handlePlayAll() {
    const korean = tokens.filter(isHangulSyllable).join("");
    if (korean) speak(korean);
  }

  return (
    <div className="space-y-6">
      {/* 輸入框 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground/60">
          貼入韓文文字
        </label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setActiveIndex(null);
          }}
          placeholder="例如：안녕하세요"
          rows={3}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-lg placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      {/* 整段播放按鈕 */}
      {input.length > 0 && (
        <button
          onClick={handlePlayAll}
          className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-80"
        >
          整段播放
        </button>
      )}

      {/* 空狀態引導 */}
      {input.length === 0 && (
        <p className="text-sm text-foreground/40">
          在上方輸入框貼入韓文，每個音節會自動拆解並可點擊播放。
        </p>
      )}

      {/* 拆解結果 */}
      {input.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-foreground/40">點擊任一音節可播放發音</p>
          <div className="flex flex-wrap gap-3">
            {tokens.map((char, index) => {
              const result = decompose(char);
              const isActive = activeIndex === index;

              if (!result) {
                // 非韓文字元
                return (
                  <span
                    key={index}
                    className="flex h-20 w-12 items-center justify-center text-lg text-foreground/30"
                  >
                    {char}
                  </span>
                );
              }

              const choChar = CHOSEONG[result.cho];
              const jungChar = JUNGSEONG[result.jung];
              const jongChar = JONGSEONG[result.jong];

              return (
                <button
                  key={index}
                  onClick={() => handleClickSyllable(char, index)}
                  className={`flex flex-col items-center rounded-xl border px-3 py-2 transition hover:scale-105 active:scale-95 ${
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40 hover:bg-muted"
                  }`}
                >
                  <span className="text-2xl font-bold">{char}</span>
                  <span className="mt-1 text-xs text-current opacity-70">
                    {choChar}+{jungChar}
                    {jongChar ? `+${jongChar}` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
