import Block from './Block';

export default function Footer() {
  return (
    <footer>
      <Block tone="base">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold tracking-tight text-foreground">◆</p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()}</p>
        </div>
      </Block>
    </footer>
  );
}
