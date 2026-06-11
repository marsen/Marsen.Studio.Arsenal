import Image from 'next/image';
import { useTranslations } from 'next-intl';

type Project = {
  name: string;
  description: string;
  tags: string[];
  url: string;
};

export default function DemosPage() {
  const t = useTranslations('demos');
  const projects = t.raw('projects') as Project[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display mb-2 text-3xl font-bold">{t('title')}</h1>
      <p className="mb-10 text-sm text-muted-foreground">{t('subtitle')}</p>

      <div className="flex flex-col gap-16">
        {projects.map((project, index) => {
          const isEven = index % 2 === 0;
          return (
            <article
              key={project.name}
              className={`group flex flex-col items-center gap-8 md:flex-row ${isEven ? '' : 'md:flex-row-reverse'}`}
            >
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-muted md:w-1/2">
                <Image
                  src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(project.url)}?w=1200&h=675`}
                  alt={project.name}
                  fill
                  className="object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                  unoptimized
                />
              </div>

              <div className="flex w-full flex-col md:w-1/2">
                <h2 className="font-display mb-2 text-xl font-semibold tracking-tight">
                  {project.name}
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-foreground/70">
                  {project.description}
                </p>
                <div className="mb-5 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
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
