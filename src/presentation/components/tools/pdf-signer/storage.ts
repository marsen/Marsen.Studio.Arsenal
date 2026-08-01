export type SavedSignature = { id: string; dataUrl: string };

const STORAGE_KEY = "arsenal.pdf-signer.signatures.v1";
const EMPTY: SavedSignature[] = [];

const listeners = new Set<() => void>();
let snapshot: SavedSignature[] = EMPTY;
let loaded = false;

function parse(raw: string | null): SavedSignature[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedSignature[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** 訂閱簽名庫變動；同分頁的寫入與跨分頁的 storage 事件都會通知。 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = parse(event.newValue);
    loaded = true;
    listener();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** 取得目前的簽名庫快照；結果會被快取，符合 useSyncExternalStore 對參考穩定性的要求。 */
export function getSnapshot(): SavedSignature[] {
  if (!loaded) {
    snapshot = parse(window.localStorage.getItem(STORAGE_KEY));
    loaded = true;
  }
  return snapshot;
}

/** SSR 時一律視為簽名庫是空的。 */
export function getServerSnapshot(): SavedSignature[] {
  return EMPTY;
}

function persist(next: SavedSignature[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  snapshot = next;
  loaded = true;
  for (const listener of listeners) listener();
}

/** 新增一份簽名到簽名庫，回傳新建立的項目（含 id）供呼叫端選取。 */
export function addSignature(dataUrl: string): SavedSignature {
  const next: SavedSignature = { id: crypto.randomUUID(), dataUrl };
  persist([...getSnapshot(), next]);
  return next;
}

/** 從簽名庫移除一份簽名；已放置在文件上的位置各自持有自己的快照，不受影響。 */
export function removeSignature(id: string): void {
  persist(getSnapshot().filter((signature) => signature.id !== id));
}
