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
  riskLog: [
    {
      text: "Pre-Party 20:00–23:30（15 €）無法參加，原擔心已付費要退費",
      resolved: true,
      note: "已知，沒付費不是問題",
    },
    {
      text: "8/17 取行李、前往中央車站，時間是否足夠",
      resolved: true,
      note: "沒問題",
    },
    {
      text: "8/17 退房後行李是否寄放中央車站置物櫃",
      resolved: true,
      note: "已定案：上午 10:00 退房後直接到中央車站寄放，After Party 可跳到 23:30 才離場。當日空檔由 12h 縮為 11h15，但全程不用扛行李",
    },
    {
      text: "Keep Swinging BP Social — 時間、地點待補",
      resolved: false,
      note: "收到，再查",
    },
    {
      text: "資料衝突：另一份表寫 8/20 17:00 離開布達佩斯，請確認車票",
      resolved: true,
      note: "已用真實車票確認：8/21 09:30 布達佩斯 → 布拉提斯拉瓦",
    },
    {
      text: "維也納 Party（7 €）— 時間、地點待補",
      resolved: false,
      note: "收到，再查",
    },
    {
      text: "維也納住宿尚未訂（8/21–8/24 共 3 晚）",
      resolved: true,
      note: "已訂：Adina Serviced Apartments Vienna ●●●●；近地鐵 Wien Quartier Belvedere，步行約 250 公尺",
    },
    {
      text: "布拉格住宿（8/14–8/17 共 3 晚）",
      resolved: true,
      note: "已訂：新城區 Krakovská ●●；近地鐵 Muzeum 站（A／C 線），步行約 5 分鐘",
    },
    {
      text: "8/14 機場到住宿的交通路線",
      resolved: true,
      note: "無軌電車 59（2024 年起取代 119 路公車）至 Nádraží Veleslavín，轉地鐵 A 線至 Muzeum，步行約 5 分鐘；90 分鐘票約 50 CZK",
    },
    {
      text: "行前準備：換錢——3 種貨幣（CZK／HUF／EUR），且無金融卡可在當地 ATM 提領",
      resolved: false,
      note: "待決定台灣先換多少歐元現鈔。25 € 僅夠付活動費（After Party 15 € + 維也納 Party 7 €），未含置物櫃、公廁、市集攤販",
    },
    {
      text: "行前準備：網路——歐洲多國 eSIM 尚未購買",
      resolved: false,
      note: "已選定 KKday #146272 每日 2GB × 15 日，使用日期填 8/13。天數無 12 日選項，10 日會在 8/24 早上到期（班機 11:15）。買前先向客服確認斯洛伐克是否涵蓋（標題清單漏列，規格表有）",
    },
    {
      text: "行前準備：eSIM 在台灣先裝好但不啟用",
      resolved: false,
      note: "安裝需網路、啟用不需要；裝完把該線路關閉，落地布拉格才開。憑證（含 ICCID）與安裝教學先截圖存離線",
    },
    {
      text: "行前準備：台灣門號漫遊設定——關數據漫遊、保留語音簡訊",
      resolved: false,
      note: "曾在日本收不到簡訊，務必打客服確認國際漫遊已開通且歐洲可收簡訊。iPhone 另需關閉「允許切換行動數據」，否則 eSIM 訊號差時會自動切回台灣門號上網",
    },
    {
      text: "行前準備：信用卡驗證改用銀行 App 推播為主力",
      resolved: false,
      note: "無金融卡、全程靠信用卡，OTP 簡訊不可靠時需要備援；出發前實測一次能否登入 App，避免「要簡訊才能登入 App」的死循環",
    },
    {
      text: "行前準備：置裝——舞鞋兩雙、大量吸汗上衣、清晨落地用薄外套",
      resolved: false,
      note: "連續 4 晚 party 加白天 5.5 小時課程，吸汗上衣需求最容易低估",
    },
    {
      text: "行前準備：行李——耳塞、安眠藥、涼感噴霧等待採購",
      resolved: false,
      note: "夜車包另備眼罩、濕紙巾、行動電源；歐規 Type C／E／F 轉接頭四國通用",
    },
    {
      text: "市內交通票尚未規劃（布拉格、布達佩斯、維也納多日票）",
      resolved: false,
      note: "8/24 07:00 維也納 Hbf → VIE 走 CAT 或 S7 也待確認",
    },
    {
      text: "入境文件：護照效期與 ETIAS 申辦狀態",
      resolved: false,
      note: "護照需 2027/02/25 之後到期（離境日起算 6 個月）；ETIAS 是否已上路請查歐盟官方，勿依賴二手資訊",
    },
  ],
  days: [
    {
      date: "2026-08-13",
      country: "台灣",
      city: "台北",
      timezone: "Asia/Taipei",
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
          title: "Pre-Party 20:00–23:30（15 €）不參加",
          note: "班機當晚起飛；未付費，無須退費",
          kind: "note",
        },
      ],
    },
    {
      date: "2026-08-14",
      country: "捷克",
      city: "布拉格",
      timezone: "Europe/Prague",
      items: [
        { start: "06:45", title: "抵達布拉格 T1", kind: "travel" },
        {
          start: "06:45",
          end: "07:45",
          title: "EES 生物辨識入境查驗",
          note: "申根 EES 首次入境需錄指紋與臉部影像，暑假尖峰排隊可能更久，先抓 1 小時",
          kind: "travel",
          warn: true,
        },
        {
          start: "07:45",
          end: "08:30",
          title: "無軌電車 59 → 地鐵 A 線 → 住宿",
          note: "T1 外搭 59 至 Nádraží Veleslavín，轉地鐵 A 線至 Muzeum，步行約 5 分鐘；90 分鐘票約 50 CZK，售票機可刷感應信用卡",
          kind: "travel",
        },
        {
          start: "08:30",
          title: "抵達 布拉格住宿 ●●●●",
          note: "新城區 Krakovská ●●；check-in 一般 15:00，可先寄放行李",
        },
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
      timezone: "Europe/Prague",
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
      timezone: "Europe/Prague",
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
      timezone: "Europe/Prague",
      items: [
        {
          start: "10:00",
          end: "10:45",
          title: "退房、行李寄放中央車站置物櫃",
          note: "已定案：上午先寄放，白天觀光與 After Party 全程不用扛行李",
          kind: "travel",
        },
        {
          start: "20:00",
          end: "23:30",
          title: "After Party（15 €）",
          note: "Jazz & Cocktail Club U Staré paní ｜ Live Band；行李已寄放，可跳到 23:30 散場",
        },
        {
          start: "23:30",
          end: "23:59",
          title: "離場、中央車站取行李",
          note: "場地離車站很近，00:36 發車前約有 1 小時緩衝",
          kind: "travel",
        },
        { title: "次日 00:36 夜車 EN ●●●● 布拉格 → 布達佩斯", kind: "travel" },
        {
          title: "布拉格唯一完整的一整天，適合排城堡區或近郊",
          note: "空檔 11h15（原 12h，扣掉上午寄放行李）",
          kind: "note",
        },
      ],
    },
    {
      date: "2026-08-18",
      country: "匈牙利",
      city: "布達佩斯",
      timezone: "Europe/Budapest",
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
      timezone: "Europe/Budapest",
      items: [{ title: "完全沒有固定行程，最適合排大行程或近郊", kind: "note" }],
    },
    {
      date: "2026-08-20",
      country: "匈牙利",
      city: "布達佩斯",
      timezone: "Europe/Budapest",
      items: [
        {
          title: "匈牙利國慶日（聖伊斯特萬日）",
          note: "市區整天活動、多瑙河煙火（往年約 21:00）。人潮極多、部分店家公休",
        },
      ],
    },
    {
      date: "2026-08-21",
      country: "斯洛伐克",
      city: "布拉提斯拉瓦",
      timezone: "Europe/Bratislava",
      items: [
        { start: "08:30", end: "09:15", title: "退房、前往 Budapest-Nyugati", kind: "travel" },
        {
          start: "09:30",
          end: "12:00",
          title: "火車 布達佩斯 → 布拉提斯拉瓦",
          note: "已依真實車票確認 09:30 發車；抵達時間為預估，請以實際車票為準",
          kind: "travel",
        },
        {
          start: "18:20",
          end: "19:50",
          title: "火車 布拉提斯拉瓦 → 維也納",
          note: "約 19:50 抵達 Wien Hauptbahnhof",
          kind: "travel",
        },
        { title: "半日遊：行李先寄放車站置物櫃，舊城區步行可繞完", kind: "note" },
        {
          title: "入住 維也納住宿 ●●●●",
          note: "8/21–8/24 共 3 晚；近地鐵 Wien Quartier Belvedere，步行約 250 公尺",
        },
      ],
    },
    {
      date: "2026-08-22",
      country: "奧地利",
      city: "維也納",
      timezone: "Europe/Vienna",
      items: [{ title: "維也納唯一完整的一天，可排宮殿、美術館或音樂會", kind: "note" }],
    },
    {
      date: "2026-08-23",
      country: "奧地利",
      city: "維也納",
      timezone: "Europe/Vienna",
      items: [
        { title: "維也納 Party（7 €）— 時間、地點待補", warn: true },
        { title: "晚上有活動，白天行程建議留在市區", kind: "note" },
      ],
    },
    {
      date: "2026-08-24",
      country: "奧地利",
      city: "維也納 → 台北",
      timezone: "Europe/Vienna",
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
  riskLog: [
    {
      text: "Pre-Party 20:00–23:30 (€15) — cannot attend; worried a refund would be needed",
      resolved: true,
      note: "Confirmed — wasn't paid, so no refund needed",
    },
    {
      text: "8/17 collect luggage, head to the main station — is there enough time?",
      resolved: true,
      note: "No problem",
    },
    {
      text: "8/17 check out and store luggage at the station?",
      resolved: true,
      note: "Settled: check out and drop bags at the main station at 10:00, so the After Party can run until 23:30. The free block shrinks from 12h to 11h15, but nothing has to be carried",
    },
    {
      text: "Keep Swinging BP Social — time and venue still missing",
      resolved: false,
      note: "Noted, will check later",
    },
    {
      text: "Conflict: another sheet says departure 8/20 17:00 — verify the ticket",
      resolved: true,
      note: "Confirmed with the real ticket: 8/21 09:30 Budapest → Bratislava",
    },
    {
      text: "Vienna party (€7) — time and venue still missing",
      resolved: false,
      note: "Noted, will check later",
    },
    {
      text: "Vienna accommodation not booked (8/21–8/24, 3 nights)",
      resolved: true,
      note: "Booked: Adina Serviced Apartments Vienna ●●●●; ~250m walk to Wien Quartier Belvedere station",
    },
    {
      text: "Prague accommodation (8/14–8/17, 3 nights)",
      resolved: true,
      note: "Booked: Krakovská ●●, Nové Město; ~5 min walk to Muzeum station (metro A/C)",
    },
    {
      text: "8/14 airport-to-accommodation route",
      resolved: true,
      note: "Trolleybus 59 (replaced bus 119 in 2024) to Nádraží Veleslavín, then metro A to Muzeum, ~5 min walk; 90-minute ticket ~50 CZK",
    },
    {
      text: "Prep: cash — three currencies (CZK/HUF/EUR) and no debit card for local ATM withdrawals",
      resolved: false,
      note: "Still deciding how many euros to buy in Taiwan. €25 only covers the event fees (After Party €15 + Vienna party €7), not lockers, toilets or market stalls",
    },
    {
      text: "Prep: connectivity — multi-country Europe eSIM not purchased yet",
      resolved: false,
      note: "Settled on KKday #146272, 2GB/day for 15 days, usage date 8/13. There is no 12-day option and 10 days expires on the morning of 8/24 (flight 11:15). Ask support to confirm Slovakia is covered — the headline list omits it, the spec table includes it",
    },
    {
      text: "Prep: install the eSIM in Taiwan but leave it switched off",
      resolved: false,
      note: "Installing needs a network, activating does not; keep the line disabled until landing in Prague. Screenshot the voucher (with ICCID) and setup guide for offline use",
    },
    {
      text: "Prep: Taiwan SIM roaming — data roaming off, voice and SMS roaming on",
      resolved: false,
      note: "SMS failed to arrive on a previous trip to Japan, so confirm with the carrier that roaming is active and SMS works in Europe. On iPhone also disable Cellular Data Switching, or it silently falls back to the Taiwan line when the eSIM signal drops",
    },
    {
      text: "Prep: switch card verification to the bank app's push approval",
      resolved: false,
      note: "No debit card and everything rides on credit cards, so SMS OTP needs a backup; test the app login before leaving to avoid the trap of needing an SMS to log in",
    },
    {
      text: "Prep: clothing — two pairs of dance shoes, plenty of sweat-wicking tops, light jacket for the early landing",
      resolved: false,
      note: "Four consecutive party nights plus 5.5h of daytime classes; the number of tops needed is the easiest thing to underestimate",
    },
    {
      text: "Prep: packing — earplugs, sleep aid, cooling spray still to buy",
      resolved: false,
      note: "Night-train kit also needs an eye mask, wet wipes and a power bank; one Type C/E/F adapter works in all four countries",
    },
    {
      text: "City transport passes not planned (Prague, Budapest, Vienna)",
      resolved: false,
      note: "8/24 07:00 Wien Hbf → VIE via CAT or S7 also undecided",
    },
    {
      text: "Entry documents: passport validity and ETIAS status",
      resolved: false,
      note: "Passport must be valid past 2027-02-25 (6 months from departure); check the official EU source for whether ETIAS applies",
    },
  ],
  days: [
    {
      date: "2026-08-13",
      country: "Taiwan",
      city: "Taipei",
      timezone: "Asia/Taipei",
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
          title: "Pre-Party 20:00–23:30 (€15) — skipping it",
          note: "Flight departs the same night; wasn't paid, so no refund needed",
          kind: "note",
        },
      ],
    },
    {
      date: "2026-08-14",
      country: "Czechia",
      city: "Prague",
      timezone: "Europe/Prague",
      items: [
        { start: "06:45", title: "Land in Prague T1", kind: "travel" },
        {
          start: "06:45",
          end: "07:45",
          title: "EES biometric border check",
          note: "First Schengen entry under EES records fingerprints and a facial image; peak summer queues can run longer — budget an hour",
          kind: "travel",
          warn: true,
        },
        {
          start: "07:45",
          end: "08:30",
          title: "Trolleybus 59 → metro A → accommodation",
          note: "Board 59 outside T1 to Nádraží Veleslavín, change to metro A for Muzeum, ~5 min walk; 90-minute ticket ~50 CZK, machines take contactless cards",
          kind: "travel",
        },
        {
          start: "08:30",
          title: "Arrive at Prague stay ●●●●",
          note: "Krakovská ●●, Nové Město; check-in usually 15:00, bags can be dropped earlier",
        },
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
      timezone: "Europe/Prague",
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
      timezone: "Europe/Prague",
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
      timezone: "Europe/Prague",
      items: [
        {
          start: "10:00",
          end: "10:45",
          title: "Check out, store bags in the main station lockers",
          note: "Settled: drop bags in the morning so neither sightseeing nor the After Party involves carrying them",
          kind: "travel",
        },
        {
          start: "20:00",
          end: "23:30",
          title: "After Party (€15)",
          note: "Jazz & Cocktail Club U Staré paní | Live Band; bags already stored, so you can stay until 23:30",
        },
        {
          start: "23:30",
          end: "23:59",
          title: "Leave, collect bags at the main station",
          note: "Venue is very close to the station; ~1 hour of buffer before the 00:36 departure",
          kind: "travel",
        },
        { title: "00:36 next day: night train EN ●●●● Prague → Budapest", kind: "travel" },
        {
          title: "The only full free day in Prague — castle district or a day trip",
          note: "Free block 11h15 (was 12h, minus the morning bag drop)",
          kind: "note",
        },
      ],
    },
    {
      date: "2026-08-18",
      country: "Hungary",
      city: "Budapest",
      timezone: "Europe/Budapest",
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
      timezone: "Europe/Budapest",
      items: [{ title: "Nothing scheduled — best day for a big outing or day trip", kind: "note" }],
    },
    {
      date: "2026-08-20",
      country: "Hungary",
      city: "Budapest",
      timezone: "Europe/Budapest",
      items: [
        {
          title: "Hungarian National Day (St. Stephen's Day)",
          note: "City-wide events and Danube fireworks (usually ~21:00). Very crowded; some shops closed",
        },
      ],
    },
    {
      date: "2026-08-21",
      country: "Slovakia",
      city: "Bratislava",
      timezone: "Europe/Bratislava",
      items: [
        {
          start: "08:30",
          end: "09:15",
          title: "Check out, head to Budapest-Nyugati",
          kind: "travel",
        },
        {
          start: "09:30",
          end: "12:00",
          title: "Train Budapest → Bratislava",
          note: "Confirmed 09:30 departure from the real ticket; arrival time is estimated — check the actual ticket",
          kind: "travel",
        },
        {
          start: "18:20",
          end: "19:50",
          title: "Train Bratislava → Vienna",
          note: "Arrives Wien Hauptbahnhof around 19:50",
          kind: "travel",
        },
        { title: "Half day: store bags at the station; old town is walkable", kind: "note" },
        {
          title: "Check in to Vienna stay ●●●●",
          note: "8/21–8/24, 3 nights; ~250m walk to Wien Quartier Belvedere station",
        },
      ],
    },
    {
      date: "2026-08-22",
      country: "Austria",
      city: "Vienna",
      timezone: "Europe/Vienna",
      items: [
        { title: "The only full day in Vienna — palaces, museums or a concert", kind: "note" },
      ],
    },
    {
      date: "2026-08-23",
      country: "Austria",
      city: "Vienna",
      timezone: "Europe/Vienna",
      items: [
        { title: "Vienna party (€7) — time and venue still missing", warn: true },
        { title: "Evening event — keep the daytime plan inside the city", kind: "note" },
      ],
    },
    {
      date: "2026-08-24",
      country: "Austria",
      city: "Vienna → Taipei",
      timezone: "Europe/Vienna",
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
