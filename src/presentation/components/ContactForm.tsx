'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type State = 'idle' | 'submitting' | 'success' | 'error';

type Props = {
  /** 覆寫預設的 CTA 按鈕文字（首頁由後台內容管理提供，其餘頁面沿用既有翻譯字串） */
  ctaLabel?: string;
};

export default function ContactForm({ ctaLabel }: Props) {
  const t = useTranslations('home');
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function reset() {
    setOpen(false);
    setState('idle');
    setName('');
    setEmail('');
    setMessage('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      setState('success');
    } catch {
      setState('error');
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        {ctaLabel ?? t('heroCta')}
      </button>
    );
  }

  if (state === 'success') {
    return (
      <p className="text-sm text-white/70">{t('contactSuccess')}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('contactNameLabel')}
        className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-accent"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('contactEmailLabel')}
        className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-accent"
      />
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('contactPlaceholder')}
        rows={3}
        className="w-full resize-none rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-accent"
      />
      {state === 'error' && (
        <p className="text-xs text-red-400">{t('contactError')}</p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {state === 'submitting' ? t('contactSubmitting') : t('contactSubmit')}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-4 py-3 text-sm text-white/50 transition-colors hover:text-white"
        >
          {t('contactClose')}
        </button>
      </div>
    </form>
  );
}
