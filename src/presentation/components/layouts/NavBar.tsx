import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/demos", label: "Demos" },
  { href: "/tools", label: "Tools" },
];

export default function NavBar() {
  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-semibold tracking-tight text-foreground">
          Marsen
        </Link>
        <ul className="flex items-center gap-6 text-sm text-muted">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:text-accent transition-colors">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
