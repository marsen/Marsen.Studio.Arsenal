'use client';

import { useState, useTransition } from 'react';
import type { LandingContent } from '@/domain/landingContent/landingContent';
import { saveLandingContentAction } from '@/app/actions/landingContent';
import LandingPageView, { type LandingStaticText } from '@/presentation/components/landing/LandingPageView';

type Locale = 'zh' | 'en';

type Props = {
  initial: Record<Locale, LandingContent>;
  staticText: Record<Locale, LandingStaticText>;
};

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground/70">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-bold text-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/**
 * 預覽用的靜態 CTA 按鈕——真實頁面用互動式 ContactForm，這裡只需要視覺呈現，
 * 不需要能真的送出表單（見 design-live-preview.md）。
 */
function PreviewCta({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-white">
      {label}
    </span>
  );
}

/**
 * 即時預覽面板：實際渲染 LandingPageView，但真實頁面的滿版斷裂背景
 * （Block/Hero 用 100vw 技巧撐出視窗寬度）在這個較窄的容器裡會需要裁切，
 * 所以外層加 overflow-hidden——文字內容的即時反映才是預覽的重點，
 * 背景是否完全頂到「視窗」邊緣在後台預覽情境不重要。
 */
function PreviewPane({ content, staticText }: { content: LandingContent; staticText: LandingStaticText }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <LandingPageView
          content={content}
          staticText={staticText}
          demosHref="#"
          ctaSlot={<PreviewCta label={content.heroCta} />}
          fullBleed={false}
        />
      </div>
    </div>
  );
}

export function ContentEditor({ initial, staticText }: Props) {
  const [locale, setLocale] = useState<Locale>('zh');
  const [content, setContent] = useState<Record<Locale, LandingContent>>(initial);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const current = content[locale];

  function update(next: LandingContent) {
    setContent((prev) => ({ ...prev, [locale]: next }));
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveLandingContentAction(locale, current);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: '已儲存，網站已更新。' });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['zh', 'en'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLocale(l)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              locale === l
                ? 'bg-accent text-background'
                : 'border border-border text-foreground/70 hover:border-accent'
            }`}
          >
            {l === 'zh' ? '中文' : 'English'}
          </button>
        ))}
      </div>

      {message && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <Section title="Hero">
            <TextField label="小標" value={current.heroEyebrow} onChange={(v) => update({ ...current, heroEyebrow: v })} />
            <TextField label="CTA 按鈕文字" value={current.heroCta} onChange={(v) => update({ ...current, heroCta: v })} />
            {current.heroSlides.map((slide, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 md:grid-cols-2">
                <TextField
                  label={`輪播 ${i + 1} - 標題`}
                  value={slide.heading}
                  onChange={(v) => {
                    const slides = [...current.heroSlides];
                    slides[i] = { ...slides[i], heading: v };
                    update({ ...current, heroSlides: slides });
                  }}
                />
                <TextField
                  label={`輪播 ${i + 1} - 副標`}
                  value={slide.sub}
                  onChange={(v) => {
                    const slides = [...current.heroSlides];
                    slides[i] = { ...slides[i], sub: v };
                    update({ ...current, heroSlides: slides });
                  }}
                />
              </div>
            ))}
          </Section>

          <Section title="服務項目">
            <TextField
              label="區塊標題"
              value={current.servicesTitle}
              onChange={(v) => update({ ...current, servicesTitle: v })}
            />
            {current.services.map((service, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                <TextField
                  label={`服務 ${i + 1} - 標題`}
                  value={service.title}
                  onChange={(v) => {
                    const services = [...current.services];
                    services[i] = { ...services[i], title: v };
                    update({ ...current, services });
                  }}
                />
                <TextAreaField
                  label={`服務 ${i + 1} - 描述`}
                  value={service.desc}
                  onChange={(v) => {
                    const services = [...current.services];
                    services[i] = { ...services[i], desc: v };
                    update({ ...current, services });
                  }}
                />
              </div>
            ))}
          </Section>

          <Section title="成功案例">
            <TextField label="區塊標題" value={current.casesTitle} onChange={(v) => update({ ...current, casesTitle: v })} />
            {current.projects.map((project, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                <TextField
                  label={`案例 ${i + 1} - 名稱`}
                  value={project.name}
                  onChange={(v) => {
                    const projects = [...current.projects];
                    projects[i] = { ...projects[i], name: v };
                    update({ ...current, projects });
                  }}
                />
                <TextAreaField
                  label={`案例 ${i + 1} - 描述`}
                  value={project.description}
                  onChange={(v) => {
                    const projects = [...current.projects];
                    projects[i] = { ...projects[i], description: v };
                    update({ ...current, projects });
                  }}
                />
                <TextField
                  label={`案例 ${i + 1} - 連結網址`}
                  value={project.url}
                  onChange={(v) => {
                    const projects = [...current.projects];
                    projects[i] = { ...projects[i], url: v };
                    update({ ...current, projects });
                  }}
                />
                <TextField
                  label={`案例 ${i + 1} - 技術標籤（逗號分隔）`}
                  value={project.tags.join(', ')}
                  onChange={(v) => {
                    const projects = [...current.projects];
                    projects[i] = { ...projects[i], tags: v.split(',').map((t) => t.trim()).filter(Boolean) };
                    update({ ...current, projects });
                  }}
                />
              </div>
            ))}
          </Section>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {isPending ? '儲存中…' : `儲存（${locale === 'zh' ? '中文' : 'English'}）`}
          </button>
        </div>

        <div className="xl:sticky xl:top-8 xl:self-start">
          <p className="mb-2 text-sm font-medium text-foreground/70">
            即時預覽（{locale === 'zh' ? '中文' : 'English'}）
          </p>
          <PreviewPane content={current} staticText={staticText[locale]} />
        </div>
      </div>
    </div>
  );
}
