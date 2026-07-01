import Image from 'next/image';
import { useTranslations } from 'next-intl';

type Project = {
  name: string;
  description: string;
  tags: string[];
  url: string;
};

const ACCENTS = [
  {
    num: 'text-amber-400',
    tag: 'bg-amber-50 border-amber-200 text-amber-700',
    glow: 'from-amber-100/70 via-orange-50/40 to-transparent',
  },
  {
    num: 'text-cyan-500',
    tag: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    glow: 'from-cyan-100/70 via-teal-50/40 to-transparent',
  },
];

export default function DemosPage() {
  const t = useTranslations('demos');
  const projects = t.raw('projects') as Project[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display mb-2 text-3xl font-bold">{t('title')}</h1>
      <p className="mb-2 text-sm text-muted-foreground">{t('subtitle')}</p>
      <p className="mb-16 text-sm text-foreground/70">{t('intro')}</p>

      <div className="flex flex-col gap-20">
        {projects.map((project, index) => {
          const isEven = index % 2 === 0;
          const accent = ACCENTS[index % ACCENTS.length];
          const num = String(index + 1).padStart(2, '0');

          return (
            <article
              key={project.name}
              className={`group flex flex-col items-start gap-8 md:flex-row ${isEven ? '' : 'md:flex-row-reverse'}`}
            >
              {/* 圖片區 */}
              <div className="relative w-full shrink-0 md:w-1/2">
                <div className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${accent.glow} blur-2xl`} />
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                  <Image
                    src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(project.url)}?w=1200&h=675`}
                    alt={project.name}
                    fill
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                    unoptimized
                    priority={index === 0}
                  />
                </div>
              </div>

              {/* 文字區 */}
              <div className="flex w-full flex-col md:w-1/2">
                <span className={`font-display mb-1 text-5xl font-bold leading-none ${accent.num} select-none opacity-30`}>
                  {num}
                </span>
                <h2 className="font-display mb-3 text-xl font-semibold tracking-tight">
                  {project.name}
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-foreground/70">
                  {project.description}
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-md border px-2 py-0.5 text-xs ${accent.tag}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start text-sm text-muted-foreground underline-offset-4 hover:text-accent hover:underline"
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
