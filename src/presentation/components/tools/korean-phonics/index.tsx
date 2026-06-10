"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import SyllableBuilder from "./syllable-builder";
import TextAnalyzer from "./text-analyzer";

type Tab = "builder" | "analyzer";

let pendingSpeak: ReturnType<typeof setTimeout> | null = null;

export function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  // 取消前一個還未播放的排程，確保只有最新的 speak 執行
  if (pendingSpeak !== null) {
    clearTimeout(pendingSpeak);
    pendingSpeak = null;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.8;
  // Chrome 已知 bug：cancel() 後立刻 speak() 有時播不出來，加 delay 修正
  // 在 delay 後才取聲音列表並明確指定韓文聲音，確保聲音已載入且正確使用
  pendingSpeak = setTimeout(() => {
    pendingSpeak = null;
    const koVoice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("ko"));
    if (koVoice) utterance.voice = koVoice;
    window.speechSynthesis.speak(utterance);
  }, 50);
}

export default function KoreanPhonics() {
  const t = useTranslations("korean");
  const [activeTab, setActiveTab] = useState<Tab>("builder");
  const speechSupported = useSyncExternalStore(
    () => () => {},
    () => "speechSynthesis" in window,
    () => true,
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "builder", label: t("tabBuilder") },
    { id: "analyzer", label: t("tabAnalyzer") },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
        <p className="mb-2 text-sm text-foreground/60">{t("subtitle")}</p>

        {!speechSupported && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
            {t("noSpeech")}
          </div>
        )}

        <div className="mb-8 flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "builder" && <SyllableBuilder speak={speak} />}
        {activeTab === "analyzer" && <TextAnalyzer speak={speak} />}
      </div>
    </main>
  );
}
