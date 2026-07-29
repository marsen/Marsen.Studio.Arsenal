"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import DayCard, { countryTone } from "./DayCard";
import { DEFAULT_MIN_GAP_MINUTES, findFreeSlots, formatDuration } from "./freeSlots";
import { parseItinerary } from "./parse";
import { getSampleItinerary } from "./sample";
import { getServerSnapshot, getSnapshot, saveItinerary, subscribe } from "./storage";
import type { FreeSlot, Itinerary } from "./types";

type Filter = "all" | "free" | "fixed";
const FILTERS: Filter[] = ["all", "free", "fixed"];

/** 資料格式提示。不放進翻譯檔，因為 ICU MessageFormat 會把大括號當成參數語法。 */
const SHAPE_HINT = `{
  "dayStart": "08:00",
  "dayEnd": "22:00",
  "minGapMinutes": 60,
  "days": [
    {
      "date": "2026-08-14",
      "country": "...",
      "city": "...",
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

  const summary = useMemo(() => {
    const byCountry = new Map<string, { days: number; minutes: number; slots: FreeSlot[] }>();
    for (const { day, freeSlots } of daysWithFreeSlots) {
      const key = day.country ?? "—";
      const entry = byCountry.get(key) ?? { days: 0, minutes: 0, slots: [] };
      entry.days += 1;
      entry.minutes += freeSlots.reduce((sum, slot) => sum + slot.minutes, 0);
      entry.slots.push(...freeSlots);
      byCountry.set(key, entry);
    }
    return [...byCountry.entries()];
  }, [daysWithFreeSlots]);

  const warnCount = useMemo(
    () => itinerary.days.reduce((sum, day) => sum + day.items.filter((i) => i.warn).length, 0),
    [itinerary],
  );

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

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display mb-2 text-3xl font-bold">{t("title")}</h1>
        <p className="mb-1 text-sm text-foreground/60">{t("subtitle")}</p>
        <p className="mb-8 text-xs text-muted-foreground">{t("privacy")}</p>

        <section className="mb-8 rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t("summaryTitle")}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {summary.map(([country, entry]) => (
              <li
                key={country}
                className={`rounded-xl border border-border border-l-4 px-4 py-3 ${countryTone(country)}`}
              >
                <p className="text-sm font-semibold text-foreground">{country}</p>
                <p className="text-xs text-muted-foreground">
                  {t("summaryDays", { count: entry.days })} ·{" "}
                  {t("summaryFree", { duration: formatDuration(entry.minutes) })}
                </p>
              </li>
            ))}
          </ul>
          {warnCount > 0 && (
            <p className="mt-4 text-xs text-orange-600 dark:text-orange-400">
              ⚠ {t("warnCount", { count: warnCount })}
            </p>
          )}
        </section>

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
            {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="button"
              onClick={applyDraft}
              className="mt-3 rounded-full border border-foreground bg-foreground px-5 py-1.5 text-sm text-background"
            >
              {t("apply")}
            </button>
          </section>
        )}

        {itinerary.title && (
          <h2 className="font-display mb-4 text-xl font-semibold">{itinerary.title}</h2>
        )}

        <div className="flex flex-col gap-3">
          {daysWithFreeSlots.map(({ day, freeSlots }) => (
            <DayCard key={day.date} day={day} freeSlots={freeSlots} filter={filter} />
          ))}
        </div>
      </div>
    </main>
  );
}
