import BrandMark from './BrandMark';

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6">
        <BrandMark size={16} />
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
