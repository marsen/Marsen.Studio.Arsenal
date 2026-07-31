"use client";

import { useMemo, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import Block from "@/presentation/components/layouts/Block";
import { buildDayWindow, chunkByCalendarWeek } from "./calendar";
import { weekdayIndex } from "./dayMeta";
import DayColumns from "./DayColumns";
import { computeTimelineWindow, DEFAULT_MIN_GAP_MINUTES, findFreeSlots } from "./freeSlots";
import { parseItinerary } from "./parse";
import { getSampleItinerary } from "./sample";
import { getServerSnapshot, getSnapshot, saveItinerary, subscribe } from "./storage";
import { formatOffsetDiff, formatUtcOffset, getUtcOffsetMinutes } from "./timezone";
import type { FreeSlot, Itinerary } from "./types";

/** `Block` 的 ink 色調沒有覆寫 --background；這裡額外覆寫，讓卡片與輸入框的 bg-background 也能吃到暗色。 */
const DARK_BACKGROUND_OVERRIDE = { "--background": "#0D0D0F" } as CSSProperties;

type Filter = "all" | "free" | "fixed";
const FILTERS: Filter[] = ["all", "free", "fixed"];

type ViewMode = "day" | "week" | "biweek";
const VIEW_MODES: ViewMode[] = ["day", "week", "biweek"];

/** 逐日檢視一次顯示的天數。 */
const DAY_WINDOW_SIZE = 3;
/** 週檢視一次顯示的天數。 */
const WEEK_WINDOW_SIZE = 7;

/** 資料格式提示。不放進翻譯檔，因為 ICU MessageFormat 會把大括號當成參數語法。 */
const SHAPE_HINT = `{
  "dayStart": "08:00",
  "dayEnd": "22:00",
  "minGapMinutes": 60,
  "riskLog": [
    { "text": "...", "resolved": false, "note": "..." }
  ],
  "days": [
    {
      "date": "2026-08-14",
      "country": "...",
      "city": "...",
      "timezone": "Europe/Prague",
      "items": [
        { "start": "15:00", "end": "18:15", "title": "...", "note": "...", "warn": false }
      ]
    }
  ]
}`;

function toJson(itinerary: Itinerary): string {
  return JSON.stringify(itinerary, null, 2);
}

export default function ItineraryPlanner() {
  const t = useTranslations("itinerary");
  const locale = useLocale();
  const sample = useMemo(() => getSampleItinerary(locale), [locale]);

  const [filter, setFilter] = useState<Filter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [dayWindowStart, setDayWindowStart] = useState(0);
  const [weekWindowOverride, setWeekWindowOverride] = useState<number | null>(null);
  const [biweekChunkIndex, setBiweekChunkIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 以 localStorage 為單一資料來源；SSR 時快照為 null，因此伺服器渲染的是範例行程
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const itinerary = useMemo<Itinerary>(() => {
    if (!stored) return sample;
    const result = parseItinerary(stored);
    return result.ok ? result.data : sample;
  }, [stored, sample]);

  const daysWithFreeSlots = useMemo(() => {
    const minGap = itinerary.minGapMinutes ?? DEFAULT_MIN_GAP_MINUTES;
    return itinerary.days.map((day) => ({
      day,
      freeSlots: findFreeSlots(day.items, {
        dayStart: day.dayStart ?? itinerary.dayStart,
        dayEnd: day.dayEnd ?? itinerary.dayEnd,
        minGapMinutes: minGap,
      }),
    }));
  }, [itinerary]);

  // 所有天共用同一把時間軸尺，方便互相比較每天的空檔。
  const timelineWindow = useMemo(() => computeTimelineWindow(itinerary), [itinerary]);

  const freeSlotsByDate = useMemo(() => {
    const map = new Map<string, FreeSlot[]>();
    for (const { day, freeSlots } of daysWithFreeSlots) map.set(day.date, freeSlots);
    return map;
  }, [daysWithFreeSlots]);

  // 依每天的 timezone 算出 UTC 偏移標籤，並跟前一天比較算出時差（偏移不變或缺少 timezone 時省略）。
  const timezoneByDate = useMemo(() => {
    const map = new Map<string, { label?: string; diffLabel?: string }>();
    let prevOffset: number | null = null;
    for (const day of itinerary.days) {
      let label: string | undefined;
      let diffLabel: string | undefined;
      const offset = day.timezone ? getUtcOffsetMinutes(day.date, day.timezone) : null;
      if (offset !== null) {
        label = formatUtcOffset(offset);
        if (prevOffset !== null && offset !== prevOffset) {
          diffLabel = formatOffsetDiff(offset - prevOffset);
        }
        prevOffset = offset;
      }
      map.set(day.date, { label, diffLabel });
    }
    return map;
  }, [itinerary]);

  // 兩週維持對齊日曆的固定分頁（一次一個雙週區塊），14 天已經很寬，不需要再分快慢兩檔導覽。
  const biweekChunks = useMemo(() => {
    if (viewMode !== "biweek") return [];
    return chunkByCalendarWeek(itinerary.days, 2);
  }, [itinerary, viewMode]);
  const biweekChunkMax = Math.max(biweekChunks.length - 1, 0);
  const clampedBiweekChunkIndex = Math.min(Math.max(biweekChunkIndex, 0), biweekChunkMax);
  const currentBiweekChunk = biweekChunks[clampedBiweekChunkIndex];

  // 逐日視窗可往行程開始前多看 (DAY_WINDOW_SIZE - 1) 天，結尾同理，讓視窗永遠固定 3 天寬。
  const dayWindowMin = -(DAY_WINDOW_SIZE - 1);
  const dayWindowMax = Math.max(itinerary.days.length - 1, dayWindowMin);
  const clampedDayWindowStart = Math.min(Math.max(dayWindowStart, dayWindowMin), dayWindowMax);

  const dayWindowSlots = useMemo(
    () => buildDayWindow(itinerary.days, clampedDayWindowStart, DAY_WINDOW_SIZE),
    [itinerary, clampedDayWindowStart],
  );

  // 週視窗預設對齊真實日曆週（週日起），使用者手動換頁後改用手動位移，行程資料變動時（尚未手動換頁）會自動重新對齊。
  const weekCalendarDefault = -weekdayIndex(itinerary.days[0].date);
  const weekWindowMin = -(WEEK_WINDOW_SIZE - 1);
  const weekWindowMax = Math.max(itinerary.days.length - 1, weekWindowMin);
  const rawWeekWindowStart = weekWindowOverride ?? weekCalendarDefault;
  const clampedWeekWindowStart = Math.min(Math.max(rawWeekWindowStart, weekWindowMin), weekWindowMax);

  const weekWindowSlots = useMemo(
    () => buildDayWindow(itinerary.days, clampedWeekWindowStart, WEEK_WINDOW_SIZE),
    [itinerary, clampedWeekWindowStart],
  );

  // 有 riskLog 時以「尚未解決」的筆數為準，沒有的話（例如舊資料）沿用天項目上的 warn 統計。
  const warnCount = useMemo(() => {
    if (itinerary.riskLog) return itinerary.riskLog.filter((risk) => !risk.resolved).length;
    return itinerary.days.reduce((sum, day) => sum + day.items.filter((i) => i.warn).length, 0);
  }, [itinerary]);

  function openEditor() {
    setDraft(toJson(itinerary));
    setError(null);
    setEditing(true);
  }

  function applyDraft() {
    const result = parseItinerary(draft);
    if (!result.ok) {
      setError(result.detail ? `${t(result.errorKey)}（${result.detail}）` : t(result.errorKey));
      return;
    }
    saveItinerary(toJson(result.data));
    setError(null);
    setEditing(false);
  }

  function resetToSample() {
    saveItinerary(null);
    setDraft(toJson(sample));
    setError(null);
  }

  function goToPrevDays() {
    setDayWindowStart((start) => Math.max(start - 1, dayWindowMin));
  }

  function goToNextDays() {
    setDayWindowStart((start) => Math.min(start + 1, dayWindowMax));
  }

  function goToPrevDayPage() {
    setDayWindowStart((start) => Math.max(start - DAY_WINDOW_SIZE, dayWindowMin));
  }

  function goToNextDayPage() {
    setDayWindowStart((start) => Math.min(start + DAY_WINDOW_SIZE, dayWindowMax));
  }

  function goToPrevWeekDays() {
    setWeekWindowOverride(Math.max(clampedWeekWindowStart - 1, weekWindowMin));
  }

  function goToNextWeekDays() {
    setWeekWindowOverride(Math.min(clampedWeekWindowStart + 1, weekWindowMax));
  }

  function goToPrevWeekPage() {
    setWeekWindowOverride(Math.max(clampedWeekWindowStart - WEEK_WINDOW_SIZE, weekWindowMin));
  }

  function goToNextWeekPage() {
    setWeekWindowOverride(Math.min(clampedWeekWindowStart + WEEK_WINDOW_SIZE, weekWindowMax));
  }

  function goToPrevBiweekChunk() {
    setBiweekChunkIndex((index) => Math.max(index - 1, 0));
  }

  function goToNextBiweekChunk() {
    setBiweekChunkIndex((index) => Math.min(index + 1, biweekChunkMax));
  }

  return (
    <Block tone="ink" compact>
      <div className="text-foreground" style={DARK_BACKGROUND_OVERRIDE}>
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display mb-2 text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="mb-1 text-sm text-foreground/60">{t("subtitle")}</p>
        <p className="mb-8 text-xs text-muted-foreground">{t("privacy")}</p>

        {itinerary.riskLog && itinerary.riskLog.length > 0 ? (
          <details className="mb-6 rounded-2xl border border-border p-4">
            <summary className="cursor-pointer text-sm font-medium text-foreground select-none">
              <span className={warnCount > 0 ? "text-[#ec835a]" : "text-muted-foreground"}>
                {warnCount > 0 ? "⚠ " : "✓ "}
                {t("riskLogSummary", { total: itinerary.riskLog.length, open: warnCount })}
              </span>
            </summary>
            <ul className="mt-3 flex flex-col gap-2">
              {itinerary.riskLog.map((risk, index) => (
                <li
                  key={index}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    risk.resolved ? "border-border/50" : "border-[#ec835a]/40"
                  }`}
                >
                  <p className={risk.resolved ? "text-muted-foreground line-through" : "text-foreground"}>
                    {risk.resolved ? "☑ " : "⚠ "}
                    {risk.text}
                  </p>
                  {risk.note && (
                    <p className={`mt-1 ${risk.resolved ? "text-muted-foreground/70" : "text-[#ec835a]"}`}>
                      {risk.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ) : (
          warnCount > 0 && (
            <p className="mb-6 text-xs text-[#ec835a]">⚠ {t("warnCount", { count: warnCount })}</p>
          )
        )}

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filter === key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground/60 hover:border-accent"
              }`}
            >
              {t(`filter.${key}`)}
            </button>
          ))}

          <span className="mx-1 h-4 w-px bg-border" />

          {VIEW_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                viewMode === mode
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-foreground/60 hover:border-accent"
              }`}
            >
              {t(`view.${mode}`)}
            </button>
          ))}

          <span className="flex-1" />

          <button
            type="button"
            onClick={editing ? () => setEditing(false) : openEditor}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent"
          >
            {editing ? t("closeEditor") : t("openEditor")}
          </button>
          <button
            type="button"
            onClick={resetToSample}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent"
          >
            {t("loadSample")}
          </button>
        </div>

        {editing && (
          <section className="mb-8 rounded-2xl border border-border p-5">
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t("editorHint")}</p>
            <pre className="mb-3 overflow-x-auto rounded-xl border border-border/60 p-3 font-mono text-[11px] leading-relaxed text-foreground/50">
              {SHAPE_HINT}
            </pre>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              spellCheck={false}
              rows={16}
              className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground"
            />
            {error && <p className="mt-2 text-xs text-[#d03b3b]">{error}</p>}
            <button
              type="button"
              onClick={applyDraft}
              className="mt-3 rounded-full border border-foreground bg-foreground px-5 py-1.5 text-sm text-background"
            >
              {t("apply")}
            </button>
          </section>
        )}
      </div>

      <div className="mx-auto max-w-none">
        {itinerary.title && (
          <h2 className="font-display mb-4 text-xl font-semibold text-foreground">{itinerary.title}</h2>
        )}

        {viewMode === "day" && (
          <>
            <div className="mb-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={goToPrevDayPage}
                disabled={clampedDayWindowStart <= dayWindowMin}
                aria-label="prev page"
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
              >
                «
              </button>
              <button
                type="button"
                onClick={goToPrevDays}
                disabled={clampedDayWindowStart <= dayWindowMin}
                aria-label="prev"
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
              >
                ‹
              </button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {dayWindowSlots[0]?.date} – {dayWindowSlots[dayWindowSlots.length - 1]?.date}
              </span>
              <button
                type="button"
                onClick={goToNextDays}
                disabled={clampedDayWindowStart >= dayWindowMax}
                aria-label="next"
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
              >
                ›
              </button>
              <button
                type="button"
                onClick={goToNextDayPage}
                disabled={clampedDayWindowStart >= dayWindowMax}
                aria-label="next page"
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
              >
                »
              </button>
            </div>

            <DayColumns
              slots={dayWindowSlots}
              freeSlotsByDate={freeSlotsByDate}
              filter={filter}
              windowStart={timelineWindow.start}
              windowEnd={timelineWindow.end}
              timezoneByDate={timezoneByDate}
            />
          </>
        )}

        {viewMode === "week" && (
          <>
            <div className="mb-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={goToPrevWeekPage}
                disabled={clampedWeekWindowStart <= weekWindowMin}
                aria-label="prev page"
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
              >
                «
              </button>
              <button
                type="button"
                onClick={goToPrevWeekDays}
                disabled={clampedWeekWindowStart <= weekWindowMin}
                aria-label="prev"
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
              >
                ‹
              </button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {weekWindowSlots[0]?.date} – {weekWindowSlots[weekWindowSlots.length - 1]?.date}
              </span>
              <button
                type="button"
                onClick={goToNextWeekDays}
                disabled={clampedWeekWindowStart >= weekWindowMax}
                aria-label="next"
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
              >
                ›
              </button>
              <button
                type="button"
                onClick={goToNextWeekPage}
                disabled={clampedWeekWindowStart >= weekWindowMax}
                aria-label="next page"
                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
              >
                »
              </button>
            </div>

            <DayColumns
              slots={weekWindowSlots}
              freeSlotsByDate={freeSlotsByDate}
              filter={filter}
              windowStart={timelineWindow.start}
              windowEnd={timelineWindow.end}
              timezoneByDate={timezoneByDate}
            />
          </>
        )}

        {viewMode === "biweek" && (
          <>
            {biweekChunks.length > 1 && (
              <div className="mb-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={goToPrevBiweekChunk}
                  disabled={clampedBiweekChunkIndex <= 0}
                  aria-label="prev"
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
                >
                  ‹
                </button>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {currentBiweekChunk?.[0]?.date} – {currentBiweekChunk?.[currentBiweekChunk.length - 1]?.date}
                </span>
                <button
                  type="button"
                  onClick={goToNextBiweekChunk}
                  disabled={clampedBiweekChunkIndex >= biweekChunkMax}
                  aria-label="next"
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:border-accent disabled:opacity-30 disabled:hover:border-border"
                >
                  ›
                </button>
              </div>
            )}

            {currentBiweekChunk && (
              <DayColumns
                slots={currentBiweekChunk}
                freeSlotsByDate={freeSlotsByDate}
                filter={filter}
                windowStart={timelineWindow.start}
                windowEnd={timelineWindow.end}
                timezoneByDate={timezoneByDate}
              />
            )}
          </>
        )}
      </div>
      </div>
    </Block>
  );
}
