export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Hi, I&apos;m Marsen
      </h1>
      <p className="text-muted">Developer. Builder. Tinkerer.</p>
      <div className="mt-4 flex gap-4">
        <a href="/demos" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-[#F7F4EE] hover:bg-accent-hover transition-colors">
          View Demos
        </a>
        <a href="/tools" className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors">
          Tools
        </a>
      </div>
    </div>
  );
}
