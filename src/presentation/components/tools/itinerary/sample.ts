import type { Itinerary } from "./types";

/**
 * 內建範例行程（2026 中歐 swing 營隊）。
 * 班機代號、車次、住宿名稱等個資已打碼為 ●，僅保留公開的活動與交通時刻。
 */
const zh: Itinerary = {
  title: "中歐 Swing 營隊 2026",
  dayStart: "08:00",
  dayEnd: "22:00",
  minGapMinutes: 60,
  days: [
    {
      date: "2026-08-13",
      country: "台灣",
      city: "台北",
      items: [
        { start: "20:50", end: "23:50", title: "桃園機場 T1 報到、候機", kind: "travel" },
        {
          start: "23:50",
          end: "23:59",
          title: "航班 CI ●● 台北 → 布拉格",
          note: "次日 06:45 抵達 Prague Vaclav Havel T1",
          kind: "travel",
        },
        {
          title: "Pre-Party 20:00–23:30（15 €）無法參加",
          note: "班機當晚起飛，若已付費要問退費",
          warn: true,
        },
      ],
    },
    {
      date: "2026-08-14",
      country: "捷克",
      city: "布拉格",
      items: [
        { start: "06:45", title: "抵達布拉格 T1", kind: "travel" },
        { start: "14:00", end: "15:00", title: "活動報到", note: "Autoclub of the Czech Republic" },
        { start: "15:00", end: "18:15", title: "Extension Class" },
        {
          start: "20:00",
          end: "03:00",
          title: "Party",
          note: "20:30 Taster ｜ 21:30 Live Band ｜ 22:00 Competition ｜ 23:30–01:30 Slow Bal",
        },
        { title: "剛下長途機，白天空檔建議留一半補眠", kind: "note" },
      ],
    },
    {
      date: "2026-08-15",
      country: "捷克",
      city: "布拉格",
      items: [
        { start: "09:45", end: "10:15", title: "報到" },
        { start: "10:15", end: "11:00", title: "Audition" },
        { start: "11:00", end: "16:40", title: "上課" },
        {
          start: "20:00",
          end: "04:00",
          title: "Party（最長的一晚）",
          note: "20:00 Taster ｜ 21:30 Live Band ｜ 22:00 Competition ｜ 23:30–01:30 Slow Bal",
        },
      ],
    },
    {
      date: "2026-08-16",
      country: "捷克",
      city: "布拉格",
      items: [
        { start: "11:00", end: "16:40", title: "上課" },
        {
          start: "20:00",
          end: "02:00",
          title: "Party",
          note: "20:00 Taster ｜ 22:00 Competition ｜ 23:30–01:00 Slow Bal",
        },
        { title: "前一晚跳到 04:00，早上空檔建議補眠", kind: "note" },
      ],
    },
    {
      date: "2026-08-17",
      country: "捷克",
      city: "布拉格 → 夜車",
      items: [
        {
          start: "20:00",
          end: "23:30",
          title: "After Party（15 €）",
          note: "Jazz & Cocktail Club U Staré paní ｜ Live Band",
        },
        {
          start: "23:30",
          end: "23:59",
          title: "取行李、前往中央車站",
          note: "距發車僅約 1 小時，建議提早離場",
          kind: "travel",
          warn: true,
        },
        { title: "退房後行李寄放中央車站置物櫃（今晚睡火車）", warn: true },
        { title: "次日 00:36 夜車 EN ●●●● 布拉格 → 布達佩斯", kind: "travel" },
        { title: "布拉格唯一完整的一整天，適合排城堡區或近郊", kind: "note" },
      ],
    },
    {
      date: "2026-08-18",
      country: "匈牙利",
      city: "布達佩斯",
      items: [
        { start: "08:29", title: "抵達 Budapest-Nyugati", kind: "travel" },
        { title: "入住 布達佩斯住宿 ●●●●", note: "一般 check-in 15:00，可先寄放行李" },
        { title: "Keep Swinging BP Social — 時間、地點待補", warn: true },
        { title: "夜車睡眠品質不佳，建議排輕鬆行程", kind: "note" },
      ],
    },
    {
      date: "2026-08-19",
      country: "匈牙利",
      city: "布達佩斯",
      items: [{ title: "完全沒有固定行程，最適合排大行程或近郊", kind: "note" }],
    },
    {
      date: "2026-08-20",
      country: "匈牙利",
      city: "布達佩斯",
      items: [
        {
          title: "匈牙利國慶日（聖伊斯特萬日）",
          note: "市區整天活動、多瑙河煙火（往年約 21:00）。人潮極多、部分店家公休",
        },
        { title: "資料衝突：另一份表寫 8/20 17:00 離開布達佩斯，請確認車票", warn: true },
      ],
    },
    {
      date: "2026-08-21",
      country: "斯洛伐克",
      city: "布拉提斯拉瓦",
      items: [
        { start: "10:30", end: "11:30", title: "退房、前往 Budapest-Nyugati", kind: "travel" },
        { start: "11:30", end: "14:00", title: "火車 布達佩斯 → 布拉提斯拉瓦", kind: "travel" },
        {
          start: "18:20",
          end: "19:50",
          title: "火車 布拉提斯拉瓦 → 維也納",
          note: "約 19:50 抵達 Wien Hauptbahnhof",
          kind: "travel",
        },
        { title: "半日遊：行李先寄放車站置物櫃，舊城區步行可繞完", kind: "note" },
        { title: "維也納住宿尚未訂（8/21–8/23 共 3 晚）", warn: true },
      ],
    },
    {
      date: "2026-08-22",
      country: "奧地利",
      city: "維也納",
      items: [{ title: "維也納唯一完整的一天，可排宮殿、美術館或音樂會", kind: "note" }],
    },
    {
      date: "2026-08-23",
      country: "奧地利",
      city: "維也納",
      items: [
        { title: "維也納 Party（7 €）— 時間、地點待補", warn: true },
        { title: "晚上有活動，白天行程建議留在市區", kind: "note" },
      ],
    },
    {
      date: "2026-08-24",
      country: "奧地利",
      city: "維也納 → 台北",
      items: [
        {
          start: "07:00",
          end: "08:15",
          title: "退房、前往機場",
          note: "Wien Hbf → VIE 約 16–25 分鐘",
          kind: "travel",
        },
        { start: "08:15", end: "11:15", title: "Vienna Schwechat T1A 報到、候機", kind: "travel" },
        {
          start: "11:15",
          end: "23:59",
          title: "航班 CI ●● 維也納 → 台北",
          note: "次日 05:30 抵達桃園機場 T1",
          kind: "travel",
        },
      ],
    },
  ],
};

const en: Itinerary = {
  title: "Central Europe Swing Camp 2026",
  dayStart: "08:00",
  dayEnd: "22:00",
  minGapMinutes: 60,
  days: [
    {
      date: "2026-08-13",
      country: "Taiwan",
      city: "Taipei",
      items: [
        { start: "20:50", end: "23:50", title: "Check-in at TPE Terminal 1", kind: "travel" },
        {
          start: "23:50",
          end: "23:59",
          title: "Flight CI ●● Taipei → Prague",
          note: "Arrives 06:45 next day, Prague Vaclav Havel T1",
          kind: "travel",
        },
        {
          title: "Pre-Party 20:00–23:30 (€15) — cannot attend",
          note: "Flight departs the same night; ask for a refund if already paid",
          warn: true,
        },
      ],
    },
    {
      date: "2026-08-14",
      country: "Czechia",
      city: "Prague",
      items: [
        { start: "06:45", title: "Land in Prague T1", kind: "travel" },
        {
          start: "14:00",
          end: "15:00",
          title: "Event check-in",
          note: "Autoclub of the Czech Republic",
        },
        { start: "15:00", end: "18:15", title: "Extension Class" },
        {
          start: "20:00",
          end: "03:00",
          title: "Party",
          note: "20:30 Taster | 21:30 Live Band | 22:00 Competition | 23:30–01:30 Slow Bal",
        },
        { title: "Straight off a long-haul flight — use half the free block to sleep", kind: "note" },
      ],
    },
    {
      date: "2026-08-15",
      country: "Czechia",
      city: "Prague",
      items: [
        { start: "09:45", end: "10:15", title: "Check-in" },
        { start: "10:15", end: "11:00", title: "Audition" },
        { start: "11:00", end: "16:40", title: "Classes" },
        {
          start: "20:00",
          end: "04:00",
          title: "Party (longest night)",
          note: "20:00 Taster | 21:30 Live Band | 22:00 Competition | 23:30–01:30 Slow Bal",
        },
      ],
    },
    {
      date: "2026-08-16",
      country: "Czechia",
      city: "Prague",
      items: [
        { start: "11:00", end: "16:40", title: "Classes" },
        {
          start: "20:00",
          end: "02:00",
          title: "Party",
          note: "20:00 Taster | 22:00 Competition | 23:30–01:00 Slow Bal",
        },
        { title: "Previous night ran to 04:00 — sleep in", kind: "note" },
      ],
    },
    {
      date: "2026-08-17",
      country: "Czechia",
      city: "Prague → night train",
      items: [
        {
          start: "20:00",
          end: "23:30",
          title: "After Party (€15)",
          note: "Jazz & Cocktail Club U Staré paní | Live Band",
        },
        {
          start: "23:30",
          end: "23:59",
          title: "Collect luggage, head to the main station",
          note: "Only ~1 hour before departure — leave early",
          kind: "travel",
          warn: true,
        },
        { title: "Check out and store luggage at the station (sleeping on the train)", warn: true },
        { title: "00:36 next day: night train EN ●●●● Prague → Budapest", kind: "travel" },
        { title: "The only full free day in Prague — castle district or a day trip", kind: "note" },
      ],
    },
    {
      date: "2026-08-18",
      country: "Hungary",
      city: "Budapest",
      items: [
        { start: "08:29", title: "Arrive Budapest-Nyugati", kind: "travel" },
        { title: "Check in to Budapest stay ●●●●", note: "Check-in usually 15:00; drop bags early" },
        { title: "Keep Swinging BP Social — time and venue still missing", warn: true },
        { title: "Poor sleep on the night train — keep the day light", kind: "note" },
      ],
    },
    {
      date: "2026-08-19",
      country: "Hungary",
      city: "Budapest",
      items: [{ title: "Nothing scheduled — best day for a big outing or day trip", kind: "note" }],
    },
    {
      date: "2026-08-20",
      country: "Hungary",
      city: "Budapest",
      items: [
        {
          title: "Hungarian National Day (St. Stephen's Day)",
          note: "City-wide events and Danube fireworks (usually ~21:00). Very crowded; some shops closed",
        },
        {
          title: "Conflict: another sheet says departure 8/20 17:00 — verify the ticket",
          warn: true,
        },
      ],
    },
    {
      date: "2026-08-21",
      country: "Slovakia",
      city: "Bratislava",
      items: [
        {
          start: "10:30",
          end: "11:30",
          title: "Check out, head to Budapest-Nyugati",
          kind: "travel",
        },
        { start: "11:30", end: "14:00", title: "Train Budapest → Bratislava", kind: "travel" },
        {
          start: "18:20",
          end: "19:50",
          title: "Train Bratislava → Vienna",
          note: "Arrives Wien Hauptbahnhof around 19:50",
          kind: "travel",
        },
        { title: "Half day: store bags at the station; old town is walkable", kind: "note" },
        { title: "Vienna accommodation not booked (8/21–8/23, 3 nights)", warn: true },
      ],
    },
    {
      date: "2026-08-22",
      country: "Austria",
      city: "Vienna",
      items: [
        { title: "The only full day in Vienna — palaces, museums or a concert", kind: "note" },
      ],
    },
    {
      date: "2026-08-23",
      country: "Austria",
      city: "Vienna",
      items: [
        { title: "Vienna party (€7) — time and venue still missing", warn: true },
        { title: "Evening event — keep the daytime plan inside the city", kind: "note" },
      ],
    },
    {
      date: "2026-08-24",
      country: "Austria",
      city: "Vienna → Taipei",
      items: [
        {
          start: "07:00",
          end: "08:15",
          title: "Check out, head to the airport",
          note: "Wien Hbf → VIE takes 16–25 minutes",
          kind: "travel",
        },
        {
          start: "08:15",
          end: "11:15",
          title: "Vienna Schwechat T1A check-in and boarding",
          kind: "travel",
        },
        {
          start: "11:15",
          end: "23:59",
          title: "Flight CI ●● Vienna → Taipei",
          note: "Arrives TPE Terminal 1 at 05:30 the next day",
          kind: "travel",
        },
      ],
    },
  ],
};

export const SAMPLE_ITINERARIES: Record<string, Itinerary> = { zh, en };

export function getSampleItinerary(locale: string): Itinerary {
  return SAMPLE_ITINERARIES[locale] ?? SAMPLE_ITINERARIES.en;
}
