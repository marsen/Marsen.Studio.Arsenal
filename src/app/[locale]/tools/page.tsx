import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/metadata";

const tools = [
  { slug: "background-removal", titleKey: "backgroundRemoval", descKey: "backgroundRemovalDesc" },
  { slug: "heic-to-jpg", titleKey: "heicToJpg", descKey: "heicToJpgDesc" },
  { slug: "korean-phonics", titleKey: "koreanPhonics", descKey: "koreanPhonicsDesc" },
  { slug: "ig-token", titleKey: "igToken", descKey: "igTokenDesc" },
];

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools.meta" });

  return buildPageMetadata({
    locale,
    path: "/tools",
    title: t("title"),
    description: t("description"),
  });
}

export default function ToolsPage() {
  const t = useTranslations("tools");

  return (
    <div className="pt-20 md:pt-28">
      <h1 className="font-display text-5xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {tools.map(({ slug, titleKey, descKey }, i) => (
          <li key={slug}>
            <Link
              href={`/tools/${slug}`}
              className="flex flex-col rounded-2xl border border-border px-6 py-8 transition-colors hover:border-accent"
            >
              <p className="mb-2 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</p>
              <span className="font-display mb-2 text-xl font-semibold text-foreground">{t(titleKey)}</span>
              <span className="text-sm leading-relaxed text-foreground/70">{t(descKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
