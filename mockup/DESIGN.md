# Design System Strategy: The Field & The Gallery

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Pitch Gallery."** 

We are moving away from the "utility-first" clutter of traditional booking engines and toward an editorial, high-end experience that treats a soccer field with the same reverence as a luxury hotel suite. This system rejects the rigid, "boxed-in" layout of legacy sports apps. Instead, we utilize **Intentional Asymmetry** and **Tonal Depth** to create a sense of movement and athletic energy. 

By blending the structural logic of *Airbnb* with the comprehensive data density of *Traveloka*, we create a "Sporty Elegance" that feels both professional and premium. The layout prioritizes breathing room, allowing high-quality imagery of the turf to serve as the primary visual driver, framed by a sophisticated system of layered surfaces.

---

## 2. Colors & Surface Logic
The palette is rooted in the natural tones of the pitch, but elevated through a Material-inspired tonal range.

### The "No-Line" Rule
To achieve a high-end feel, **this design system prohibits the use of 1px solid borders for sectioning.** Boundaries are defined strictly through background color shifts. 
- Use `surface` (#f7fbf1) as your base.
- Use `surface-container-low` (#f2f5ec) for large sectioning.
- Use `surface-container-highest` (#e0e4db) for interactive card containers.
- **The Result:** A layout that feels seamlessly integrated rather than a collection of boxes.

### Surface Hierarchy & Nesting
Treat the UI as a physical landscape. A search bar should not just "sit" on the page; it should float using `surface-container-lowest` (#ffffff) over a `surface-container` (#ecefe6) hero area. This "nested depth" mimics the layers of a well-maintained field.

### Signature Textures (The "Glass & Gradient" Rule)
*   **The Pitch Gradient:** For primary CTAs and hero headers, use a subtle linear gradient: `primary` (#00450d) to `primary-container` (#1b5e20). This provides "soul" and prevents the deep green from looking flat or "muddy."
*   **The Frosted Glass:** For floating navigation or "Quick Book" bars, utilize `surface` colors at 80% opacity with a `20px` backdrop-blur. This ensures the vibrant green of the field images bleeds through, softening the interface.

---

## 3. Typography: The Editorial Edge
We employ a dual-font strategy to balance athletic boldness with functional clarity.

*   **Display & Headline (Plus Jakarta Sans):** These are your "Star Players." They are wide, geometric, and modern. Use `display-lg` (3.5rem) for hero statements to create an authoritative, editorial feel.
*   **Body & Labels (Inter):** The "Workhorse." Inter provides exceptional legibility at small sizes. Use `body-md` (0.875rem) for field descriptions and `label-sm` (0.6875rem) for metadata like "5-a-side" or "Indoor."

**Hierarchy Note:** Always maintain a high contrast between your headlines (`on-surface`) and your body text (`on-surface-variant`). This creates the "Airbnb" level of clarity where information is consumed effortlessly.

---

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering.**

*   **The Layering Principle:** To lift a card, do not reach for a shadow first. Instead, place a `surface-container-lowest` card on a `surface-container-low` background. The slight shift in lightness creates a sophisticated "lift."
*   **Ambient Shadows:** Where floating is required (e.g., a "Confirm Booking" modal), use an ultra-diffused shadow: `Y: 12px, Blur: 40px, Color: rgba(25, 29, 23, 0.06)`. Note the color is a tint of `on-surface`, not pure black.
*   **The Ghost Border:** If a border is required for accessibility, use `outline-variant` (#c0c9bb) at **15% opacity**. It should be a whisper of a line, never a shout.

---

## 5. Component Signature Styles

### Buttons (The "Stadium" Cut)
*   **Primary:** Gradient of `primary` to `primary-container`. Corner radius: `md` (0.75rem). No border.
*   **Secondary:** Solid `secondary-container` (#91f78e) with `on-secondary-container` text.
*   **Tertiary:** Ghost style. No background; `primary` text. Use for "View All" or "Cancel."

### Field Cards (The "No-Divider" Rule)
*   **Structure:** Forbid internal divider lines. Separate the field image, the title, and the price using vertical whitespace (Spacing Scale `1.5rem`).
*   **Hover:** On hover, the card should transition from `surface` to `surface-container-high` and the image should subtly scale (1.05x) within its mask.

### Availability Chips
*   **Selected:** `primary` background with `on-primary` text.
*   **Available:** `surface-container-highest` background.
*   **Booked:** `surface-variant` with a strike-through or 40% opacity.

### Search Inputs (The "Traveloka" Pattern)
*   Large, pill-shaped (`full` roundedness) containers using `surface-container-lowest`. 
*   Use `label-md` for the "Destination/Pitch Name" and `body-lg` for the actual input value to create clear information hierarchy.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a separator. If you feel the need for a line, add 16px of padding instead.
*   **DO** use high-quality, wide-angle photography of the soccer fields.
*   **DO** use `xl` (1.5rem) rounded corners for hero images and `md` (0.75rem) for interactive components.

### Don't
*   **DON'T** use #000000 for text. Use `on-surface` (#191d17) to keep the "elegant" vibe.
*   **DON'T** use 100% opaque borders. It breaks the "Pitch Gallery" editorial flow.
*   **DON'T** use standard "bright red" for errors. Use the sophisticated `error` (#ba1a1a) and `error-container` tokens provided to maintain the premium palette.

---

## 7. Roundedness Scale
*   **sm (0.25rem):** Minor tags/badges.
*   **md (0.75rem):** Standard interactive elements (Buttons, Inputs, Cards).
*   **xl (1.5rem):** Large structural containers and Image masks.
*   **full (9999px):** Search bars and pill-tags.