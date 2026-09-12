## Goal

Replace the placeholder blocks and emoji accents with AI-generated realistic food photography, and upgrade the scroll animation so each dish rotates 15–30° as it scrolls while real ingredient cutouts fly into place.

## Images to generate

Dish hero shots (square, angled 3/4 view, dark premium background matching the site's dark theme):

- Greek Chicken Salad — plated on a dark ceramic plate
- ABC Cold-Pressed Juice — tall glass, deep ruby juice
- Power Oatmeal Bowl — layered bowl, angled

Ingredient cutouts (transparent PNGs, no background):

- Salad: olives, cherry tomato, julienned carrot, lettuce leaf, sesame seeds, pomegranate arils
- Juice: apple slice, beetroot half, carrot
- Oatmeal: mixed nuts, dark chocolate chunk, seeds, barley grains

All saved under `src/assets/` and referenced through a single constants file so any image can be swapped for a real photo later.

## Animation upgrade

- **Dish rotation:** map `scrollYProgress` to a rotation of about −18° → +12° (tuned per section) plus a slight 3D tilt, so the plate/glass/bowl visibly turns as the section passes through the viewport. No full spin.
- **Depth:** dish scales and lifts slightly; a soft glow behind it grows with the same progress.
- **Ingredient cutouts:** each flies in from off-canvas with its own translate, rotation, and stagger (existing per-accent ranges), now as real transparent PNGs instead of emoji chips — no circular chip border, just the ingredient with a soft drop shadow.
- **Parallax layering:** accents move at slightly different speeds than the dish so the scene has depth.
- **Reduced motion:** everything renders in its final state, no scroll binding (existing behaviour preserved).
- **Mobile:** fewer cutouts (already 3), smaller rotation range, images lazy-loaded.

## Technical details

- `src/components/landing/DishImage.tsx` — add `rotate` and `rotateY`/`y` transforms driven by the same `progress` motion value; accept a `rotateRange` prop per section.
- `src/components/landing/FloatingAccent.tsx` — change `AccentSpec` from `emoji: string` to `image: string` (imported asset), drop the chip styling, add per-accent parallax factor.
- `src/components/landing/{Salad,Juice,Oatmeal}Section.tsx` — update accent specs to point at the new cutout assets; pass rotation ranges.
- `src/lib/placeholders.ts` — replaced by real asset imports (kept as the single swap point).
- Images imported as ES6 assets so Vite fingerprints and optimizes them.
