/** 單一行程項目的種類，用於決定卡片上的視覺樣式。 */
export type ItemKind = "fixed" | "travel" | "note";

export type ItineraryItem = {
  /** 開始時間，格式 HH:mm。省略代表「全天／時間未定」，不佔用時段。 */
  start?: string;
  /** 結束時間，格式 HH:mm。省略代表瞬時事件（例如班機抵達），不佔用時段。 */
  end?: string;
  title: string;
  note?: string;
  kind?: ItemKind;
  /** 標記為待確認或有風險的項目。 */
  warn?: boolean;
};

export type ItineraryDay = {
  /** 日期，格式 YYYY-MM-DD。 */
  date: string;
  country?: string;
  city?: string;
  /** 覆寫該日的活動起始時間，預設取行程層級設定。 */
  dayStart?: string;
  /** 覆寫該日的活動結束時間，預設取行程層級設定。 */
  dayEnd?: string;
  items: ItineraryItem[];
};

export type Itinerary = {
  title?: string;
  /** 每日視為「可活動」的起始時間，預設 09:00。 */
  dayStart?: string;
  /** 每日視為「可活動」的結束時間，預設 22:00。 */
  dayEnd?: string;
  /** 小於此長度的空檔不列出，單位為分鐘，預設 60。 */
  minGapMinutes?: number;
  days: ItineraryDay[];
};

export type FreeSlot = {
  /** 空檔開始時間，格式 HH:mm。 */
  start: string;
  /** 空檔結束時間，格式 HH:mm。 */
  end: string;
  /** 空檔長度（分鐘）。 */
  minutes: number;
};
