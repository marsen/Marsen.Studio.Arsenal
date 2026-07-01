export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-center px-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} ◆
      </div>
    </footer>
  );
}
