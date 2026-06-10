"use client";

import { useEffect, useState } from "react";
import { compose } from "@/lib/hangul/compose";
import { CHOSEONG, JUNGSEONG, JONGSEONG, CHOSEONG_ROMAN, JUNGSEONG_ROMAN, CHOSEONG_EXAMPLES, JUNGSEONG_EXAMPLES, SYLLABLE_EXAMPLES } from "@/lib/hangul/data";
import { consonantSound } from "@/lib/hangul/pronounce";

const CHO_GROUPS = [
  { label: "基本子音", indices: [0, 2, 3, 5, 6, 7, 9, 11, 12, 14, 15, 16, 17, 18], collapsible: false },
  { label: "硬音（緊音）", indices: [1, 4, 8, 10, 13], collapsible: true },
];

const JUNG_GROUPS = [
  { label: "基本母音", indices: [0, 1, 4, 5, 8, 13, 18, 20], collapsible: false },
  { label: "Y 系母音", indices: [2, 3, 6, 7, 12, 17], collapsible: false },
  { label: "複合母音", indices: [9, 10, 11, 14, 15, 16, 19], collapsible: true },
];

const JONG_GROUPS = [
  { label: "常用", indices: [0, 1, 4, 7, 8, 16, 17, 19, 21], collapsible: false },
  { label: "複合尾音", indices: [2, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 18, 20, 22, 23, 24, 25, 26, 27], collapsible: true },
];

interface Props {
  speak: (text: string) => void;
}

function GroupLabel({ label, collapsible, expanded, count, onToggle }: {
  label: string;
  collapsible: boolean;
  expanded: boolean;
  count: number;
  onToggle: () => void;
}) {
  return (
    <div className="mb-2 mt-4 flex items-center gap-2 first:mt-0">
      <span className="text-xs font-medium text-foreground/40">{label}</span>
      {collapsible && (
        <button
          onClick={onToggle}
          className="text-xs text-foreground/30 transition hover:text-foreground"
        >
          {expanded ? "收起" : `展開 +${count}`}
        </button>
      )}
    </div>
  );
}

export default function SyllableBuilder({ speak }: Props) {
  const [cho, setCho] = useState<number | null>(null);
  const [jung, setJung] = useState<number | null>(null);
  const [jong, setJong] = useState<number>(0);
  const [showHardCho, setShowHardCho] = useState(false);
  const [showCompoundJung, setShowCompoundJung] = useState(false);
  const [showCompoundJong, setShowCompoundJong] = useState(false);

  const IEUNG = 11;
  const effectiveCho = cho ?? IEUNG;

  const syllable = jung !== null ? compose(effectiveCho, jung, jong) : null;
  const display: string | null = syllable ?? (cho !== null ? CHOSEONG[cho] : null);

  useEffect(() => {
    if (syllable) {
      speak(syllable);
    } else if (cho !== null) {
      speak(consonantSound(CHOSEONG[cho]));
    }
  }, [syllable, cho]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleReset() {
    setCho(null);
    setJung(null);
    setJong(0);
  }

  const choExpanded = [false, showHardCho];
  const jungExpanded = [false, false, showCompoundJung];
  const jongExpanded = [false, showCompoundJong];

  return (
    <div className="space-y-8">
      {/* 結果顯示 */}
      <div className="flex items-center gap-6">
        <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-border bg-card text-6xl font-bold">
          {display}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { if (syllable) speak(syllable); else if (cho !== null) speak(consonantSound(CHOSEONG[cho])); }}
            disabled={!display}
            className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-80 disabled:opacity-30"
          >
            重播
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-border px-5 py-2 text-sm font-medium transition hover:bg-muted"
          >
            重設
          </button>
        </div>
      </div>

      {/* 範例單詞 */}
      {(cho !== null || jung !== null) && (() => {
        // 子音+母音都選了：用組合音節查找例詞，找不到則退回個別例詞
        if (syllable !== null) {
          const syllableEx = SYLLABLE_EXAMPLES[syllable];
          if (syllableEx) {
            return (
              <div className="space-y-2">
                <p className="text-xs text-foreground/40">範例單詞（點擊播放）</p>
                <button
                  onClick={() => speak(syllableEx.word)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-muted"
                >
                  <span className="font-medium">{syllableEx.word}</span>
                  <span className="text-foreground/50">（{syllableEx.meaning}）</span>
                </button>
              </div>
            );
          }
          // 組合音節沒有例詞，退回個別顯示
        }
        // 只選了子音或母音，或組合音節無例詞
        const choEx = cho !== null ? CHOSEONG_EXAMPLES[CHOSEONG[cho]] : null;
        const jungEx = jung !== null ? JUNGSEONG_EXAMPLES[JUNGSEONG[jung]] : null;
        if (!choEx && !jungEx) return null;
        return (
          <div className="space-y-2">
            <p className="text-xs text-foreground/40">範例單詞（點擊播放）</p>
            <div className="flex flex-wrap gap-2">
              {choEx && (
                <button
                  onClick={() => speak(choEx.word)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-muted"
                >
                  <span className="font-medium">{choEx.word}</span>
                  <span className="text-foreground/50">（{choEx.meaning}）</span>
                </button>
              )}
              {jungEx && (
                <button
                  onClick={() => speak(jungEx.word)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition hover:bg-muted"
                >
                  <span className="font-medium">{jungEx.word}</span>
                  <span className="text-foreground/50">（{jungEx.meaning}）</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* 子音 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">子音</h2>
        {CHO_GROUPS.map((group, gi) => {
          const expanded = choExpanded[gi];
          const visible = !group.collapsible || expanded;
          const visibleIndices = visible
            ? group.indices
            : group.indices.filter(i => cho === i);
          if (group.collapsible && !expanded && visibleIndices.length === 0 && !visible) return (
            <GroupLabel key={gi} label={group.label} collapsible count={group.indices.length} expanded={false} onToggle={() => setShowHardCho(true)} />
          );
          return (
            <div key={gi}>
              <GroupLabel
                label={group.label}
                collapsible={group.collapsible}
                expanded={expanded}
                count={group.indices.length}
                onToggle={() => setShowHardCho(v => !v)}
              />
              {(visible || visibleIndices.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {(visible ? group.indices : visibleIndices).map(i => (
                    <button
                      key={i}
                      onClick={() => setCho(cho === i ? null : i)}
                      className={`flex h-14 w-14 flex-col items-center justify-center rounded-lg border transition ${
                        cho === i
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <span className="text-base font-medium">{CHOSEONG[i]}</span>
                      <span className="text-xs opacity-60">{CHOSEONG_ROMAN[CHOSEONG[i]]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* 母音 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">母音</h2>
        {JUNG_GROUPS.map((group, gi) => {
          const expanded = jungExpanded[gi];
          const visible = !group.collapsible || expanded;
          const visibleIndices = visible
            ? group.indices
            : group.indices.filter(i => jung === i);
          return (
            <div key={gi}>
              <GroupLabel
                label={group.label}
                collapsible={group.collapsible}
                expanded={expanded}
                count={group.indices.length}
                onToggle={() => setShowCompoundJung(v => !v)}
              />
              {(visible || visibleIndices.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {(visible ? group.indices : visibleIndices).map(i => (
                    <button
                      key={i}
                      onClick={() => setJung(jung === i ? null : i)}
                      className={`flex h-14 min-w-[3.5rem] flex-col items-center justify-center rounded-lg border px-1 transition ${
                        jung === i
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <span className="text-base font-medium">{JUNGSEONG[i]}</span>
                      <span className="text-xs opacity-60">{JUNGSEONG_ROMAN[JUNGSEONG[i]]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* 尾音 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground/60">尾音（可選）</h2>
        {JONG_GROUPS.map((group, gi) => {
          const expanded = jongExpanded[gi];
          const visible = !group.collapsible || expanded;
          const visibleIndices = visible
            ? group.indices
            : group.indices.filter(i => jong === i);
          return (
            <div key={gi}>
              <GroupLabel
                label={group.label}
                collapsible={group.collapsible}
                expanded={expanded}
                count={group.indices.length}
                onToggle={() => setShowCompoundJong(v => !v)}
              />
              {(visible || visibleIndices.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {(visible ? group.indices : visibleIndices).map(i => (
                    <button
                      key={i}
                      onClick={() => setJong(jong === i && i !== 0 ? 0 : i)}
                      className={`h-10 min-w-10 rounded-lg border px-2 text-base font-medium transition ${
                        jong === i
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {JONGSEONG[i] === "" ? "無" : JONGSEONG[i]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
