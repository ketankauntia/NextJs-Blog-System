---
title: "The Typography Decisions That Actually Change Reading"
description: "Five typographic choices measurably change how much of a page people read. Most redesigns spend their effort on the other forty that do not."
category: Design
tags: [typography, web design, readability, accessibility]
publishedAt: "2026-08-11T08:30:00+05:30"
author: ketan
cornerstone: true
coverTone: chart-2
keyphrase: web typography readability
tldr: "Reading comfort on the web is governed by a short list of decisions: measure, line height, size at the smallest breakpoint, contrast, and paragraph rhythm. Typeface choice matters far less than any of them, which is why a redesign that only swaps the font rarely changes how much people read."
keyTakeaways:
  - "Line length between roughly 45 and 75 characters is the single highest-leverage typographic decision on a page."
  - "Line height should grow with measure; a wide column set at tight leading is the most common readability failure."
  - "Body text below 16 pixels forces zoom on phones, which quietly costs you readers who never mention it."
  - "Contrast ratios are a floor, not a target, and pure black on pure white is above the comfortable range for long reading."
  - "Vertical rhythm is what makes a page feel calm; inconsistent spacing reads as noise even when every element is individually fine."
faqs:
  - q: "What is the ideal line length for body text?"
    a: "Between about 45 and 75 characters per line, including spaces. In CSS the honest way to set that is a max-width in the ch unit on the text container, because ch tracks the font actually in use rather than assuming an average character width."
  - q: "Does the choice of typeface matter at all?"
    a: "It matters for tone and for edge cases: a face with genuinely distinct l, I and 1, real italics rather than synthesised ones, and adequate x-height. Beyond that, a well-set common face outperforms a distinctive face set badly, every time."
  - q: "Is a serif or sans-serif better for screen reading?"
    a: "At modern screen densities the difference is not meaningful for comprehension. Choose on tone and on how well the family covers the weights you need. Screens in 2005 favoured sans-serif for real rendering reasons that no longer apply."
  - q: "How much contrast should body text have?"
    a: "Clear WCAG AA at 4.5:1 as a minimum for body copy. Going much beyond 12:1 for long-form text often reads as harsh, which is why many editorial sites use a very dark grey rather than pure black."
---

Most typography advice is about taste. This is about the five decisions that change whether someone finishes the page, ordered by how much they matter.

## Measure comes first

Line length, or measure, is where reading either works or does not. Too long and the eye loses the return sweep, landing on the wrong line and forcing a re-read the reader is not conscious of. Too short and the sentence fragments into stutters.

:::stat 45-75 | Characters per line where sustained reading is most comfortable

The mistake is setting this in pixels. A 700px column is a comfortable 68 characters in one face and a punishing 95 in another. The `ch` unit measures the width of the digit zero in the font actually being used, so it tracks the type instead of guessing at it.

```css
.prose {
  max-width: 68ch;
}
```

One line. It is the highest-leverage line of CSS in most stylesheets.

:::callout The exception worth knowing
Reference material that is scanned rather than read, such as API tables and changelogs, tolerates and often benefits from a wider measure. The 45 to 75 range is for prose someone reads in sequence.
:::

## Line height is a function of measure, not a constant

Leading and measure are one decision, not two. The wider the column, the more vertical separation the eye needs to find the next line reliably. A `line-height` of 1.5 that feels generous at 45 characters feels cramped at 75.

| Measure | Line height | Typical use |
|---|---|---|
| 45-55ch | 1.45-1.55 | Narrow columns, sidebars |
| 55-70ch | 1.55-1.7 | Article body text |
| 70-75ch | 1.7-1.8 | Wide single-column layouts |
| Headings | 1.1-1.25 | Any size above 24px |

Headings run the other way. Large type at 1.5 falls apart into separate lines that no longer read as one phrase.

Set `line-height` unitless. A unitless value is inherited as a ratio and recomputed against each element's own size; a value in `px` or `em` is inherited as a fixed distance and quietly ruins every nested element that is not the same size as its parent.

## Size, decided at the smallest breakpoint

The common failure is designing body text on a large monitor and then scaling down. Do it the other way. Set the size that is comfortable on a phone held at arm's length, then let it grow.

- 16px is the floor for body text, not a target. Below it, mobile browsers may zoom on focus and readers pinch to compensate.
- 17px to 19px is where most long-form sites land for the article body.
- Small print at 13px or 14px is acceptable for metadata and captions, never for anything you expect to be read closely.

Fluid sizing with `clamp()` handles the middle range without a stack of breakpoints:

```css
:root {
  --step-0: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);
}
```

The minimum protects small screens, the maximum stops text ballooning on a 32-inch display, and the middle term does the interpolation.

## Contrast: a floor and a ceiling

WCAG AA asks for 4.5:1 on body text. Treat that as the point below which the page is broken, not the point at which it is done.

The less-discussed half is that maximum contrast is not optimal contrast. Pure black on pure white sits near 21:1, and over a long article many readers find it glaring, particularly on a bright display. Editorial sites converge on a very dark grey around `#1a1a1a` to `#222` for a reason.

> Accessible and comfortable are different properties. A design can pass every automated check and still be tiring to read for twenty minutes.

Dark mode inverts the problem: pure white text on pure black produces halation, where the light glyphs appear to bleed. Soften both ends, `#e8e8e8` on `#121212` rather than `#fff` on `#000`.

## Rhythm is what makes a page feel finished

The last decision is the one readers never articulate. When spacing is derived from a single scale, a page reads as calm. When every margin was chosen by eye, it reads as noise even though no individual value is wrong.

Pick one base unit, derive everything from it, and let the spacing between elements encode their relationship:

- [x] Space below a heading is smaller than the space above it, so the heading binds to the text it introduces
- [x] Paragraph spacing is consistent and does not double after lists or blockquotes
- [x] Every vertical gap on the page comes from the same scale
- [ ] Cap heights and baselines align across adjacent columns
- [ ] Optical corrections applied where mathematical alignment looks wrong

The last two are refinements. The first three are the difference between a page that feels designed and one that feels assembled.

---

## The order to work in

If you have limited time on a redesign, spend it in this order: measure, then line height, then size at the small breakpoint, then contrast, then rhythm. Typeface selection comes after all five, and it will change the page's character without changing its readability much at all.

That ordering is unintuitive, because typeface is the decision that feels like typography. It is simply not the decision that determines whether someone reaches the end.
