/**
 * Shared "open ring" brand mark for next/og-rendered images (icon, apple-icon,
 * opengraph-image). Built from three stacked solid shapes (disc, hole, wedge)
 * rather than a border with mixed solid/transparent sides — Satori renders a
 * visible seam at the color-transition corners of that technique, especially
 * at larger sizes.
 *
 * The wedge's angle is computed directly into its clip-path polygon rather
 * than applied via a CSS transform on the group — Satori doesn't rotate
 * absolutely-positioned children along with a transformed parent.
 */
type ArcMarkProps = {
  size: number;
  thickness: number;
  color: string;
  holeColor: string;
  /** Angle in degrees (clockwise from east) where the ring's opening is centered. */
  angle?: number;
};

const GAP_HALF_WIDTH = 45;
const RADIUS_PERCENT = 100;

function pointOnCircle(angleDeg: number): string {
  const rad = (angleDeg * Math.PI) / 180;
  const x = 50 + RADIUS_PERCENT * Math.cos(rad);
  const y = 50 + RADIUS_PERCENT * Math.sin(rad);
  return `${x}% ${y}%`;
}

export function ArcMark({ size, thickness, color, holeColor, angle = 150 }: ArcMarkProps) {
  const inner = size - thickness * 2;
  const wedgeClipPath = `polygon(50% 50%, ${pointOnCircle(angle - GAP_HALF_WIDTH)}, ${pointOnCircle(angle + GAP_HALF_WIDTH)})`;

  return (
    <div style={{ display: 'flex', position: 'relative', width: size, height: size }}>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: 9999,
          background: color,
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: thickness,
          left: thickness,
          width: inner,
          height: inner,
          borderRadius: 9999,
          background: holeColor,
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          clipPath: wedgeClipPath,
          background: holeColor,
        }}
      />
    </div>
  );
}
