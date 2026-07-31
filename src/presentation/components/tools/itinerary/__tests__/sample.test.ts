import { describe, expect, it } from "vitest";
import { findFreeSlots } from "../freeSlots";
import { itinerarySchema } from "../parse";
import { SAMPLE_ITINERARIES, getSampleItinerary } from "../sample";
import type { Itinerary } from "../types";

const LOCALES = Object.keys(SAMPLE_ITINERARIES);

describe("內建範例行程", () => {
  it("應提供 en 與 zh 兩種語系", () => {
    expect(LOCALES.sort()).toEqual(["en", "zh"]);
  });

  for (const locale of LOCALES) {
    const sample: Itinerary = SAMPLE_ITINERARIES[locale];

    describe(locale, () => {
      it("應符合行程 schema", () => {
        expect(itinerarySchema.safeParse(sample).success).toBe(true);
      });

      it("日期應由早到晚且不重複", () => {
        const dates = sample.days.map((day) => day.date);
        expect([...new Set(dates)]).toHaveLength(dates.length);
        expect([...dates].sort()).toEqual(dates);
      });

      it("每天都應算得出空檔結果而不拋錯", () => {
        for (const day of sample.days) {
          const slots = findFreeSlots(day.items, {
            dayStart: day.dayStart ?? sample.dayStart,
            dayEnd: day.dayEnd ?? sample.dayEnd,
            minGapMinutes: sample.minGapMinutes,
          });
          expect(Array.isArray(slots)).toBe(true);
        }
      });

      it("不應在範例中留下未打碼的班機或車次號碼", () => {
        const text = JSON.stringify(sample);
        expect(/\b(CI|EN|BR|OZ)\s?\d{2,}\b/.test(text)).toBe(false);
      });
    });
  }

  it("未知語系應回退到 en", () => {
    expect(getSampleItinerary("ja")).toBe(SAMPLE_ITINERARIES.en);
  });
});
