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

      <div className="flex flex-col gap-6">
        {projects.map((project) => (
          <article
            key={project.name}
            className="group rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/20 hover:shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {project.name}
              </h2>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:text-accent hover:underline"
              >
                {t('visit')}
              </a>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-foreground/70">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
