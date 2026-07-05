type Props = {
  size?: number;
  className?: string;
};

/**
 * The site's "open ring" mark, rendered with plain CSS (real browsers blend
 * the border corner colors smoothly, unlike the next/og renderer used for
 * favicon/OG images, which needs a different technique — see lib/brand-mark.tsx).
 */
export default function BrandMark({ size = 20, className = '' }: Props) {
  const thickness = Math.round(size * 0.22);

  return (
    <span
      className={`inline-block rounded-full border-accent ${className}`}
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        transform: 'rotate(-60deg)',
      }}
    />
  );
}
