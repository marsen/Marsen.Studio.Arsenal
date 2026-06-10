"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type FormState = "idle" | "loading" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  session_expired: "授權逾時，請重新開始",
  invalid_session: "Session 無效，請重新開始",
  no_code: "Instagram 未回傳授權碼",
  token_exchange_failed: "換取 Token 失敗，請確認 App ID / Secret 正確",
  long_token_failed: "換取 Long-lived Token 失敗",
};

const APP_ID_CACHE_KEY = "ig_app_id";
const TOKEN_CACHE_KEY = "ig_long_lived_token";
const TOKEN_EXPIRY_CACHE_KEY = "ig_token_cache_expiry";
const TOKEN_CACHE_DAYS = 90;

export default function IgTokenGenerator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cachedToken, setCachedToken] = useState<string | null>(null);
  const [cachedDaysLeft, setCachedDaysLeft] = useState<number | null>(null);

  const token = searchParams.get("token");
  const expiresRaw = searchParams.get("expires");
  const urlError = searchParams.get("error");

  const expiresInDays = expiresRaw ? Math.floor(Number(expiresRaw) / 86400) : null;
  const errorMessage =
    fetchError ??
    (urlError ? (ERROR_MESSAGES[urlError] ?? `未知錯誤：${urlError}`) : null);

  // 讀取 sessionStorage 快取的 App ID
  useEffect(() => {
    const cached = sessionStorage.getItem(APP_ID_CACHE_KEY);
    // client-only 初始化：mount 後從 storage 讀一次，刻意用 effect 避免 SSR hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cached) setAppId(cached);
  }, []);

  // 讀取 localStorage 快取的 Token
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_CACHE_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_CACHE_KEY);
    if (stored && expiry) {
      const expiryMs = Number(expiry);
      if (expiryMs > Date.now()) {
        // client-only 初始化：mount 後從 storage 讀一次，刻意用 effect 避免 SSR hydration mismatch
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCachedToken(stored);
        setCachedDaysLeft(Math.floor((expiryMs - Date.now()) / 86400000));
      } else {
        localStorage.removeItem(TOKEN_CACHE_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_CACHE_KEY);
      }
    }
  }, []);

  // 新 Token 取得後存入 localStorage
  useEffect(() => {
    if (token) {
      const expiry = Date.now() + TOKEN_CACHE_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(TOKEN_CACHE_KEY, token);
      localStorage.setItem(TOKEN_EXPIRY_CACHE_KEY, expiry.toString());
    }
  }, [token]);

  function handleAppIdChange(value: string) {
    setAppId(value);
    sessionStorage.setItem(APP_ID_CACHE_KEY, value);
  }

  async function handleCopy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClearCache() {
    localStorage.removeItem(TOKEN_CACHE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_CACHE_KEY);
    setCachedToken(null);
    setCachedDaysLeft(null);
  }

  function handleReset() {
    setFormState("idle");
    setFetchError(null);
    setAppId("");
    setAppSecret("");
    handleClearCache();
    router.replace("/tools/ig-token");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("loading");
    setFetchError(null);

    const res = await fetch("/api/instagram/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, appSecret }),
    });

    if (!res.ok) {
      setFormState("error");
      setFetchError("無法建立授權請求");
      return;
    }

    const { authUrl } = await res.json() as { authUrl: string };
    window.location.href = authUrl;
  }

  if (token && expiresInDays !== null) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-3xl font-bold">IG Token 產生器</h1>
          <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/5 p-6">
            <p className="mb-1 text-sm font-medium text-green-600">Token 取得成功</p>
            <p className="mb-4 text-xs text-foreground/50">有效期約 {expiresInDays} 天，請妥善保存</p>
            <div className="mb-4 break-all rounded-lg bg-muted p-4 font-mono text-xs">
              {token}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleCopy(token)}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-80"
              >
                {copied ? "已複製" : "複製 Token"}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-muted"
              >
                重新產生
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-2 text-3xl font-bold">IG Token 產生器</h1>
        <p className="mb-8 text-sm text-foreground/60">
          輸入 App ID 與 App Secret，完成 Instagram 授權後自動產出 Long-lived Token（有效期約 60 天）。
          App Secret 僅在伺服器端使用，不會外洩。
        </p>

        {cachedToken !== null && cachedDaysLeft !== null && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
            <p className="mb-1 text-sm font-medium text-blue-600">
              上次取得的 Token（快取剩 {cachedDaysLeft} 天）
            </p>
            <div className="mb-3 break-all rounded-lg bg-muted p-3 font-mono text-xs">
              {cachedToken}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleCopy(cachedToken)}
                className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-80"
              >
                {copied ? "已複製" : "複製"}
              </button>
              <button
                onClick={handleClearCache}
                className="rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-muted"
              >
                清除快取
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMessage && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Instagram App ID</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => handleAppIdChange(e.target.value)}
              placeholder="1234567890123456"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Instagram App Secret</label>
            <input
              type="password"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              placeholder="••••••••••••••••"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <p className="text-xs text-foreground/50">僅傳至伺服器端，不會記錄或儲存</p>
          </div>

          <button
            type="submit"
            disabled={formState === "loading"}
            className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-80 disabled:opacity-50"
          >
            {formState === "loading" ? "跳轉中..." : "開始 Instagram 授權"}
          </button>
        </form>
      </div>
    </div>
  );
}
