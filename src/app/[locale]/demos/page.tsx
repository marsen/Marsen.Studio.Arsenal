import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/metadata';
import { GetLandingContent } from '@/application/landingContent/getLandingContent';
import { getLandingContentRepository } from '@/infrastructure/di/landingContentContainer';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'demos.meta' });

  return buildPageMetadata({
    locale,
    path: '/demos',
    title: t('title'),
    description: t('description'),
  });
}

export default async function DemosPage({ params }: Props) {
  const { locale } = await params;
  const localeKey = locale === 'zh' ? 'zh' : 'en';
  const t = await getTranslations({ locale, namespace: 'demos' });
  const { projects } = await new GetLandingContent(getLandingContentRepository()).execute(localeKey);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display mb-3 text-5xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mb-2 text-sm text-muted-foreground">{t('subtitle')}</p>
      <p className="mb-16 text-sm text-foreground/70">{t('intro')}</p>

      <div className="flex flex-col gap-20">
        {projects.map((project, index) => {
          const isEven = index % 2 === 0;
          const num = String(index + 1).padStart(2, '0');

          return (
            <article
              key={project.name}
              className={`group flex flex-col items-start gap-8 md:flex-row ${isEven ? '' : 'md:flex-row-reverse'}`}
            >
              {/* 圖片區 */}
              <div className="relative w-full shrink-0 md:w-1/2">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
                  <Image
                    src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(project.url)}?w=1200&h=675`}
                    alt={project.name}
                    fill
                    className="object-cover object-top transition duration-300 group-hover:scale-[1.01]"
                    unoptimized
                    priority={index === 0}
                  />
                </div>
              </div>

              {/* 文字區 */}
              <div className="flex w-full flex-col md:w-1/2">
                <span className="mb-1 text-xs font-medium tracking-wide text-accent">{num}</span>
                <h2 className="font-display mb-3 text-2xl font-bold tracking-tight">
                  {project.name}
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-foreground/70">
                  {project.description}
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex self-start items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  {t('visit')}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
