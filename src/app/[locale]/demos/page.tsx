import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/metadata';
import { GetLandingContent } from '@/application/landingContent/getLandingContent';
import { getLandingContentRepository } from '@/infrastructure/di/landingContentContainer';
import Block from '@/presentation/components/layouts/Block';
import GlossyHeroBanner from '@/presentation/components/layouts/GlossyHeroBanner';

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
    <div className="flex flex-col">
      <GlossyHeroBanner compact>
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-5xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        </div>
      </GlossyHeroBanner>

      <Block tone="ghost">
        <div className="mx-auto flex max-w-4xl flex-col gap-20">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;
            const num = String(index + 1).padStart(2, '0');

            return (
              <article
                key={project.name}
                className={`group flex flex-col items-start gap-8 md:flex-row ${isEven ? '' : 'md:flex-row-reverse'}`}
              >
                {/* 圖片區：還沒有預覽圖的案例用佔位框撐住版面，維持左右交錯的節奏 */}
                <div className="relative w-full shrink-0 md:w-1/2">
                  {project.image ? (
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-background">
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover object-top transition duration-300 group-hover:scale-[1.01]"
                        priority={index === 0}
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
                      <span className="text-xs text-muted-foreground">{t('imagePending')}</span>
                    </div>
                  )}
                </div>

                {/* 文字區 */}
                <div className="flex w-full flex-col md:w-1/2">
                  <div className="mb-1 flex items-center gap-3">
                    <span className="font-mono text-xs text-accent">{num}</span>
                    {project.badge && (
                      <span className="rounded-full border border-accent/40 px-2.5 py-0.5 text-xs text-accent">
                        {project.badge}
                      </span>
                    )}
                  </div>
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
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex self-start items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                    >
                      {t('visit')}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">{t('noPublicSite')}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </Block>
    </div>
  );
}
