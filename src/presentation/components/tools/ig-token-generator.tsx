"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";

type FormState = "idle" | "loading" | "error";

const URL_ERROR_KEY_MAP: Record<string, string> = {
  session_expired: "errSession",
  invalid_session: "errInvalidSession",
  no_code: "errNoCode",
  token_exchange_failed: "errTokenFailed",
  long_token_failed: "errLongTokenFailed",
};

const APP_ID_CACHE_KEY = "ig_app_id";
const TOKEN_CACHE_KEY = "ig_long_lived_token";
const TOKEN_EXPIRY_CACHE_KEY = "ig_token_cache_expiry";
const TOKEN_CACHE_DAYS = 90;

export default function IgTokenGenerator() {
  const t = useTranslations("igToken");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cachedToken, setCachedToken] = useState<string | null>(null);
  const [cachedDaysLeft, setCachedDaysLeft] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const token = searchParams.get("token");
  const expiresRaw = searchParams.get("expires");
  const urlError = searchParams.get("error");

  const expiresInDays = expiresRaw ? Math.floor(Number(expiresRaw) / 86400) : null;

  const errorMessage: string | null =
    fetchError ??
    (urlError
      ? t((URL_ERROR_KEY_MAP[urlError] ?? "errSession") as Parameters<typeof t>[0])
      : null);

  // client-only 初始化：mount 後從 storage 讀一次，刻意用 effect 避免 SSR hydration mismatch
  useEffect(() => {
    const cached = sessionStorage.getItem(APP_ID_CACHE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cached) setAppId(cached);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_CACHE_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_CACHE_KEY);
    if (stored && expiry) {
      const expiryMs = Number(expiry);
      if (expiryMs > Date.now()) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCachedToken(stored);
        setCachedDaysLeft(Math.floor((expiryMs - Date.now()) / 86400000));
      } else {
        localStorage.removeItem(TOKEN_CACHE_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_CACHE_KEY);
      }
    }
  }, []);

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
      setFetchError(t("errStart"));
      return;
    }

    const { authUrl } = await res.json() as { authUrl: string };
    window.location.href = authUrl;
  }

  if (token && expiresInDays !== null) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
          <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/5 p-6">
            <p className="mb-1 text-sm font-medium text-green-600">{t("successTitle")}</p>
            <p className="mb-4 text-xs text-foreground/50">{t("successNote", { days: expiresInDays })}</p>
            <div className="mb-4 break-all rounded-lg bg-muted p-4 font-mono text-xs">
              {token}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleCopy(token)}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-80"
              >
                {copied ? t("copied") : t("copyToken")}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-muted"
              >
                {t("regenerate")}
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
        <div className="mb-2 flex items-center gap-2">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            aria-expanded={showHelp}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-foreground/30 text-xs text-foreground/50 transition hover:border-foreground/60 hover:text-foreground/80"
          >
            ?
          </button>
        </div>

        {showHelp && (
          <div className="mb-6 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground/70">
            <p className="mb-2">{t("helpIntro")}</p>
            <ol className="mb-3 list-decimal pl-4 space-y-1">
              <li>
                {t("helpStep1")}{" "}
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-accent"
                >
                  {t("helpStep1Link")}
                </a>
              </li>
              <li>{t("helpStep2")}</li>
              <li>{t("helpStep3")}</li>
              <li>{t("helpStep4")}</li>
              <li>{t("helpStep5")}</li>
            </ol>
            <p className="text-xs text-foreground/50">{t("helpNote")}</p>
          </div>
        )}

        <p className="mb-8 text-sm text-foreground/60">{t("subtitle")}</p>

        {cachedToken !== null && cachedDaysLeft !== null && (
          <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
            <p className="mb-1 text-sm font-medium text-blue-600">
              {t("cachedToken", { days: cachedDaysLeft })}
            </p>
            <div className="mb-3 break-all rounded-lg bg-muted p-3 font-mono text-xs">
              {cachedToken}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleCopy(cachedToken)}
                className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:opacity-80"
              >
                {copied ? t("copied") : t("copy")}
              </button>
              <button
                onClick={handleClearCache}
                className="rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-muted"
              >
                {t("clearCache")}
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
            <label className="text-sm font-medium">{t("labelAppId")}</label>
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
            <label className="text-sm font-medium">{t("labelAppSecret")}</label>
            <input
              type="password"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              placeholder="••••••••••••••••"
              required
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          <button
            type="submit"
            disabled={formState === "loading"}
            className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-80 disabled:opacity-50"
          >
            {formState === "loading" ? t("submitting") : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
