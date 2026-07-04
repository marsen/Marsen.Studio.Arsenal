/**
 * Loads a subsetted Google Font file for use with `next/og`'s ImageResponse.
 * Satori (the renderer behind ImageResponse) only understands truetype/opentype,
 * so this asks Google's CSS2 API for those formats specifically via the
 * `text` param, which also keeps the downloaded font tiny (only the glyphs used).
 */
export async function loadGoogleFont(family: string, text: string, weight = 700): Promise<ArrayBuffer> {
  const params = new URLSearchParams({ family: `${family}:wght@${weight}`, text });
  const css = await fetch(`https://fonts.googleapis.com/css2?${params}`).then((res) => res.text());
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);

  if (!match) {
    throw new Error(`[og-font] No truetype/opentype source found for "${family}"`);
  }

  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) {
    throw new Error(`[og-font] Failed to download font file for "${family}" (${fontRes.status})`);
  }

  return fontRes.arrayBuffer();
}
