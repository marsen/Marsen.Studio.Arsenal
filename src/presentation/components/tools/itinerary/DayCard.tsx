"use client";

import { useTranslations } from "next-intl";
import { formatDuration } from "./freeSlots";
import type { FreeSlot, ItineraryDay, ItineraryItem } from "./types";

const COUNTRY_TONES = [
  "border-l-rose-400",
  "border-l-emerald-400",
  "border-l-sky-400",
  "border-l-amber-400",
  "border-l-violet-400",
  "border-l-teal-400",
];

/** 依國家名稱穩定對應到一組固定色票，讓同一國家在整份行程中顏色一致。 */
export function countryTone(country: string | undefined): string {
  if (!country) return "border-l-border";
  let hash = 0;
  for (const char of country) hash = (hash * 31 + char.codePointAt(0)!) % 9973;
  return COUNTRY_TONES[hash % COUNTRY_TONES.length];
}

/** 由 YYYY-MM-DD 取得星期索引（0 = 週日），以 UTC 計算避免時區造成的水合差異。 */
export function weekdayIndex(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function itemTimeLabel(item: ItineraryItem, allDayLabel: string): string {
  if (!item.start) return allDayLabel;
  if (!item.end) return item.start;
  return `${item.start}–${item.end}`;
}

type Props = {
  day: ItineraryDay;
  freeSlots: FreeSlot[];
  /** 篩選模式：全部、只看空檔、只看固定行程。 */
  filter: "all" | "free" | "fixed";
};

export default function DayCard({ day, freeSlots, filter }: Props) {
  const t = useTranslations("itinerary");

  const showItems = filter !== "free";
  const showFree = filter !== "fixed";
  const warnItems = day.items.filter((item) => item.warn);
  const visibleItems = showItems ? day.items : warnItems;
  const totalFree = freeSlots.reduce((sum, slot) => sum + slot.minutes, 0);

  return (
    <article
      className={`rounded-2xl border border-border border-l-4 bg-background ${countryTone(day.country)}`}
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-5 py-3">
        <h3 className="font-display text-lg font-semibold text-foreground">{day.date}</h3>
        <span className="text-xs text-muted-foreground">{t(`weekday.${WEEKDAY_KEYS[weekdayIndex(day.date)]}`)}</span>
        <span className="flex-1 text-sm text-foreground/70">
          {[day.country, day.city].filter(Boolean).join(" · ")}
        </span>
        {showFree && totalFree > 0 && (
          <span className="rounded-full border border-amber-400/60 px-2.5 py-0.5 text-xs text-amber-600 dark:text-amber-300">
            {t("freeTotal", { duration: formatDuration(totalFree) })}
          </span>
        )}
      </header>

      <ul className="divide-y divide-border/60 px-5">
        {showFree &&
          freeSlots.map((slot) => (
            <li key={`free-${slot.start}`} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4">
              <span className="min-w-28 text-sm tabular-nums text-amber-600 dark:text-amber-300">
                {slot.start}–{slot.end}
              </span>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-300">
                {t("freeSlot", { duration: formatDuration(slot.minutes) })}
              </span>
            </li>
          ))}

        {visibleItems.map((item, index) => (
          <li
            key={`item-${index}-${item.title}`}
            className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4"
          >
            <span className="min-w-28 text-sm tabular-nums text-muted-foreground">
              {itemTimeLabel(item, t("allDay"))}
            </span>
            <span className="flex-1">
              <span
                className={`text-sm font-medium ${item.warn ? "text-orange-600 dark:text-orange-400" : "text-foreground"}`}
              >
                {item.warn && "⚠ "}
                {item.title}
              </span>
              {item.note && (
                <span className="mt-0.5 block text-xs leading-relaxed text-foreground/60">
                  {item.note}
                </span>
              )}
            </span>
          </li>
        ))}

        {visibleItems.length === 0 && freeSlots.length === 0 && (
          <li className="py-3 text-sm text-muted-foreground">{t("nothingHere")}</li>
        )}
      </ul>
    </article>
  );
}
