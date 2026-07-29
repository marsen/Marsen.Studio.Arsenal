import { z } from "zod";
import type { Itinerary } from "./types";

const timeSchema = z
  .string()
  .regex(/^\d{1,2}:\d{2}$/, "time must be HH:mm")
  .optional();

const itemSchema = z.object({
  start: timeSchema,
  end: timeSchema,
  title: z.string().min(1),
  note: z.string().optional(),
  kind: z.enum(["fixed", "travel", "note"]).optional(),
  warn: z.boolean().optional(),
});

const daySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  country: z.string().optional(),
  city: z.string().optional(),
  dayStart: timeSchema,
  dayEnd: timeSchema,
  items: z.array(itemSchema).default([]),
});

export const itinerarySchema = z.object({
  title: z.string().optional(),
  dayStart: timeSchema,
  dayEnd: timeSchema,
  minGapMinutes: z.number().int().positive().optional(),
  days: z.array(daySchema).min(1, "days must not be empty"),
});

export type ParseResult =
  | { ok: true; data: Itinerary }
  | { ok: false; errorKey: "errJson" | "errShape"; detail?: string };

/** 解析使用者貼上的行程 JSON，失敗時回傳可翻譯的錯誤 key。 */
export function parseItinerary(raw: string): ParseResult {
  let json: unknown;

  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, errorKey: "errJson" };
  }

  const parsed = itinerarySchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const path = first?.path.join(".");
    return {
      ok: false,
      errorKey: "errShape",
      detail: path ? `${path}: ${first.message}` : first?.message,
    };
  }

  return { ok: true, data: parsed.data };
}
