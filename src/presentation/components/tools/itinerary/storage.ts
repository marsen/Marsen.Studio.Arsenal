const STORAGE_KEY = "arsenal.itinerary.v1";

const listeners = new Set<() => void>();
let snapshot: string | null = null;
let loaded = false;

/** 訂閱行程資料變動；同分頁的寫入與跨分頁的 storage 事件都會通知。 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = event.newValue;
    loaded = true;
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** 取得目前快照；結果會被快取，符合 useSyncExternalStore 對參考穩定性的要求。 */
export function getSnapshot(): string | null {
  if (!loaded) {
    snapshot = window.localStorage.getItem(STORAGE_KEY);
    loaded = true;
  }
  return snapshot;
}

/** SSR 時一律視為沒有儲存資料，讓伺服器渲染出範例行程。 */
export function getServerSnapshot(): string | null {
  return null;
}

/** 寫入（或以 null 清除）行程資料，並同步通知所有訂閱者。 */
export function saveItinerary(value: string | null): void {
  if (value === null) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, value);
  }
  snapshot = value;
  loaded = true;
  for (const listener of listeners) listener();
}
