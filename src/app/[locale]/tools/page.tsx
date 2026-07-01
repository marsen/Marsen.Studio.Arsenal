import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const tools = [
  { slug: "background-removal", emoji: "🪄", titleKey: "backgroundRemoval", descKey: "backgroundRemovalDesc" },
  { slug: "heic-to-jpg", emoji: "📁", titleKey: "heicToJpg", descKey: "heicToJpgDesc" },
  { slug: "korean-phonics", emoji: "🇰🇷", titleKey: "koreanPhonics", descKey: "koreanPhonicsDesc" },
  { slug: "ig-token", emoji: "📸", titleKey: "igToken", descKey: "igTokenDesc" },
];

export default function ToolsPage() {
  const t = useTranslations("tools");

  return (
    <div>
      <h1 className="font-display text-5xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {tools.map(({ slug, emoji, titleKey, descKey }) => (
          <li key={slug}>
            <Link
              href={`/tools/${slug}`}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-accent"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="font-semibold text-foreground">{t(titleKey)}</span>
              <span className="text-sm text-muted-foreground">{t(descKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
