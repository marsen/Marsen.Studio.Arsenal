"use client";

import { useTranslations } from "next-intl";
import type { CalendarSlot } from "./calendar";
import { countryHex, countryTone, WEEKDAY_KEYS, weekdayIndex } from "./dayMeta";
import { formatDuration, toMinutes } from "./freeSlots";
import type { FreeSlot } from "./types";

/** 每分鐘對應的像素高度；欄數越多（週／兩週）密度越高，才不會整體太高。 */
function minuteHeightFor(columnCount: number): number {
  if (columnCount <= 3) return 0.4;
  if (columnCount <= 7) return 0.34;
  return 0.28;
}

/** 共用時刻軸欄寬（px）。 */
const AXIS_WIDTH = 36;

type TimezoneMeta = { label?: string; diffLabel?: string };

type Props = {
  slots: CalendarSlot[];
  freeSlotsByDate: Map<string, FreeSlot[]>;
  /** 篩選模式：全部、只看空檔、只看固定行程。 */
  filter: "all" | "free" | "fixed";
  /** 時間軸顯示範圍（分鐘），跨檢視共用同一把尺。 */
  windowStart: number;
  windowEnd: number;
  timezoneByDate: Map<string, TimezoneMeta>;
};

/**
 * 逐日並排檢視的共用模板：3 日／週／兩週都是同一套元件，差別只在傳入的天數（slots 長度）。
 * 所有欄位共用同一條時刻軸、格線相連無間隔，最大化寬度利用率。
 */
export default function DayColumns({
  slots,
  freeSlotsByDate,
  filter,
  windowStart,
  windowEnd,
  timezoneByDate,
}: Props) {
  const t = useTranslations("itinerary");
  const showItems = filter !== "free";
  const showFree = filter !== "fixed";
  const minuteHeight = minuteHeightFor(slots.length);
  const dense = slots.length > 3;

  // 底部多留一點高度，避免最後一筆行程的文字標籤被容器的 overflow-hidden 裁掉。
  const totalHeight = Math.max(windowEnd - windowStart, 60) * minuteHeight + 24;
  const hours: number[] = [];
  for (let h = Math.ceil(windowStart / 60); h <= Math.floor(windowEnd / 60); h++) hours.push(h);
  const topFor = (minutes: number) => (minutes - windowStart) * minuteHeight;

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div
        className="grid"
        style={{ gridTemplateColumns: `${AXIS_WIDTH}px repeat(${slots.length}, minmax(0, 1fr))` }}
      >
        <div className="border-r border-b border-border" />
        {slots.map((slot) => {
          const day = slot.day;
          const freeSlots = day ? (freeSlotsByDate.get(day.date) ?? []) : [];
          const totalFree = freeSlots.reduce((sum, s) => sum + s.minutes, 0);
          const tz = timezoneByDate.get(slot.date);
          const allDayItems = (day?.items ?? []).filter((item) => toMinutes(item.start) === null);
          const visibleAllDay = showItems ? allDayItems : allDayItems.filter((item) => item.warn);

          return (
            <div
              key={`head-${slot.date}`}
              className={`border-r border-b border-border px-2 py-2 ${
                day ? `border-l-4 ${countryTone(day.country)}` : "opacity-40"
              }`}
            >
              {day ? (
                <>
                  <div className="flex flex-wrap items-baseline gap-x-1.5">
                    <h3 className={`font-display font-semibold text-foreground ${dense ? "text-xs" : "text-base"}`}>
                      {dense ? slot.date.slice(5) : slot.date}
                    </h3>
                    <span className="text-[10px] text-muted-foreground">
                      {t(`weekday.${WEEKDAY_KEYS[weekdayIndex(slot.date)]}`)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-foreground/70">
                    {[day.country, day.city].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {tz?.label && (
                      <span className="rounded-full border border-border px-1 py-0.5 text-[9px] text-muted-foreground">
                        {tz.label}
                      </span>
                    )}
                    {showFree && totalFree > 0 && (
                      <span className="rounded-full border border-[#c98500]/50 px-1 py-0.5 text-[9px] text-[#c98500]">
                        {dense ? formatDuration(totalFree) : t("freeTotal", { duration: formatDuration(totalFree) })}
                      </span>
                    )}
                  </div>
                  {tz?.diffLabel && !dense && (
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      ⏱ {t("timezoneDiff", { diff: tz.diffLabel })}
                    </p>
                  )}
                  {visibleAllDay.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {visibleAllDay.map((item, index) => (
                        <span
                          key={`allday-${index}-${item.title}`}
                          title={item.note}
                          className={`rounded-full border px-1 py-0.5 text-[9px] ${dense ? "max-w-full truncate" : ""} ${
                            item.warn ? "border-[#ec835a]/50 text-[#ec835a]" : "border-border text-muted-foreground"
                          }`}
                        >
                          {item.warn && "⚠ "}
                          {item.title}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[10px] text-muted-foreground">{dense ? slot.date.slice(5) : slot.date}</p>
              )}
            </div>
          );
        })}

        <div className="relative border-r border-border" style={{ height: totalHeight }}>
          {hours.map((h) => (
            <span
              key={h}
              className="absolute -translate-y-1/2 pr-1 text-right text-[9px] tabular-nums text-muted-foreground"
              style={{ top: topFor(h * 60), right: 0 }}
            >
              {String(h % 24).padStart(2, "0")}
            </span>
          ))}
        </div>

        {slots.map((slot) => {
          const day = slot.day;
          const freeSlots = day ? (freeSlotsByDate.get(day.date) ?? []) : [];
          const timedItems = (day?.items ?? []).filter((item) => toMinutes(item.start) !== null);
          const visibleTimed = showItems ? timedItems : timedItems.filter((item) => item.warn);

          return (
            <div
              key={`body-${slot.date}`}
              className={`relative border-r border-border px-1 pb-1 ${
                day ? `border-l-4 ${countryTone(day.country)}` : "opacity-40"
              }`}
              style={{ height: totalHeight }}
            >
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute right-0 left-0 border-t border-border/20"
                  style={{ top: topFor(h * 60) }}
                />
              ))}

              {showFree &&
                freeSlots.map((slotFree) => {
                  const start = toMinutes(slotFree.start)!;
                  const end = toMinutes(slotFree.end)!;
                  const top = topFor(start);
                  const height = Math.max((end - start) * minuteHeight, 2);
                  return (
                    <div key={`free-${slotFree.start}`}>
                      <div className="absolute right-0 left-0 rounded-sm bg-[#c98500]/15" style={{ top, height }} />
                      {!dense && (
                        <div className="absolute left-1 text-[10px] font-medium text-[#c98500]" style={{ top }}>
                          {t("freeSlot", { duration: formatDuration(slotFree.minutes) })}
                        </div>
                      )}
                    </div>
                  );
                })}

              {visibleTimed.map((item, index) => {
                const start = toMinutes(item.start)!;
                const rawEnd = toMinutes(item.end);
                const end = rawEnd === null ? start : rawEnd < start ? windowEnd : rawEnd;
                const top = topFor(start);
                const barHeight = rawEnd === null ? 6 : Math.max((end - start) * minuteHeight, 4);
                const barColor = item.warn ? "#ec835a" : countryHex(day?.country);
                const timeLabel = `${item.start}${item.end ? `–${item.end}` : ""}`;

                return (
                  <div
                    key={`item-${index}-${item.title}`}
                    title={dense ? `${timeLabel} ${item.title}${item.note ? ` — ${item.note}` : ""}` : item.note}
                    className="absolute left-1 flex max-w-[calc(100%-0.5rem)] items-start gap-1"
                    style={{ top }}
                  >
                    <span
                      className="mt-0.5 w-1 shrink-0 rounded-full"
                      style={{ height: barHeight, backgroundColor: barColor }}
                    />
                    <div className="text-[10px] leading-tight overflow-hidden">
                      {!dense && <span className="tabular-nums text-muted-foreground">{timeLabel}</span>}{" "}
                      <span
                        className={`font-medium ${dense ? "truncate" : ""} ${item.warn ? "text-[#ec835a]" : "text-foreground"}`}
                      >
                        {item.warn && "⚠ "}
                        {item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
