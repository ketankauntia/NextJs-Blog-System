import {
  Bricolage_Grotesque,
  Fraunces,
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  Instrument_Serif,
  Inter,
  Newsreader,
  Space_Grotesk,
} from "next/font/google";

/**
 * Every candidate face, loaded once at module scope as next/font requires.
 *
 * Each declares a CSS variable; the root layout puts all of them on <body> and
 * globals.css maps the active pairing's variables onto --font-heading and
 * --font-sans. Only the faces the chosen pairing actually renders get preloaded
 * by the browser, so carrying the alternatives costs build output, not load time.
 */

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

/** Every font variable, for the <body> className. */
export const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  fraunces.variable,
  instrumentSerif.variable,
  inter.variable,
  bricolage.variable,
  spaceGrotesk.variable,
  ibmPlexSans.variable,
  newsreader.variable,
].join(" ");
