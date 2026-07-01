export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6">
        <p className="text-sm font-bold tracking-tight text-foreground">◆</p>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
