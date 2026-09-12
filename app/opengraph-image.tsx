import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Next.js powers the product. We’re building what it doesn’t ship.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const screenshot = readFile(join(process.cwd(), "assets/social/opengraph-image.png"));

export default async function OpengraphImage() {
  const data = await screenshot;
  return new ImageResponse(
    // ImageResponse requires an ordinary image element, not next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={`data:image/png;base64,${data.toString("base64")}`} width={size.width} height={size.height} />,
    size,
  );
}
