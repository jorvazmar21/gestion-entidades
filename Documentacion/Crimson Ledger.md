# Design System Specification: Editorial ERP Excellence

## 1. Overview & Creative North Star
### The Creative North Star: "The Architectural Ledger"
Most ERP systems suffer from "data-density fatigue"—a cluttered landscape of borders, boxes, and grey-on-grey inputs. This design system rejects the template-driven approach in favor of **The Architectural Ledger**. It is an aesthetic grounded in authority, clarity, and tonal depth.

By leveraging a high-contrast palette of deep maroons and obsidian grays against cool, airy surfaces, we move away from "software" and toward a "curated executive experience." We break the traditional grid through intentional white space, staggered headers, and a "paper-on-glass" layering logic. The result is a system that feels like a premium editorial publication but performs with the power of a heavy-duty enterprise tool.

---

## 2. Colors
The palette is divided into two distinct emotional zones: the **Command Zone** (Deep Reds/Obsidians) for navigation and critical actions, and the **Canvas Zone** (Light Grays/Cool Whites) for data and focus.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections or regions. In this design system, boundaries are created through background shifts.
- To separate the sidebar from the main stage, use `inverse_surface` (#27313f) against `surface` (#f8f9ff).
- To separate a table header from a body, use `surface_container_low` (#eff4ff) as a backing plate rather than a line.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack.
- **Level 0 (The Floor):** `background` (#f8f9ff)
- **Level 1 (Sectioning):** `surface_container` (#e6eeff)
- **Level 2 (Active Cards):** `surface_container_lowest` (#ffffff)
- **Level 3 (Floating Menus):** `surface_bright` (#f8f9ff) with ambient shadows.

### The "Glass & Gradient" Rule
To add soul to the ERP, apply a subtle linear gradient to main Action Buttons and the Sidebar header: `primary` (#5f030a) to `primary_container` (#7f1d1d) at a 135-degree angle. For floating notification panes, use `surface_container_lowest` with a 12px `backdrop-blur` and 85% opacity.

---

## 3. Typography
We use a dual-font strategy to balance industrial strength with editorial elegance.

* **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-humanist" feel. Use `display-lg` and `headline-md` for dashboard totals and module titles. The wide tracking in Manrope conveys stability and authority.
* **Body & Labels (Inter):** The workhorse of the system. `body-md` and `label-sm` are optimized for maximum legibility in high-density data tables.
* **Intentional Contrast:** Pair a `headline-sm` in `on_surface` (#121c2a) with a `label-md` in `primary` (#5f030a) to create clear entry points for the eye without needing bold dividers.

---

## 4. Elevation & Depth
Depth is a functional tool, not a decoration. We use **Tonal Layering** to define importance.

* **The Layering Principle:** Instead of shadows, nest containers. Place a `surface_container_lowest` (Pure White) data card inside a `surface_container` (Soft Blue-Gray) wrapper. The contrast creates a natural "lift."
* **Ambient Shadows:** For high-level modals, use a shadow with a 32px blur, 0px spread, and 6% opacity of `on_surface`. It should look like a soft glow, not a dark smudge.
* **The "Ghost Border" Fallback:** If accessibility requires a border (e.g., in high-contrast mode), use `outline_variant` (#dec0bd) at 15% opacity. It must be barely perceptible—a "ghost" of a line.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text, `rounded-md` (0.375rem). Use for the "final" action (Save, Submit).
- **Secondary:** `surface_container_high` fill with `primary` text. No border.
- **Tertiary:** Transparent background, `on_surface_variant` text. High-padding for touch/click targets.

### Input Fields
- **Resting State:** `surface_container_low` background with a `rounded-sm` corner.
- **Focus State:** Background shifts to `surface_container_lowest`, and a 2px "Ghost Border" of `primary` appears.
- **Error State:** Fill remains, but the label shifts to `error` (#ba1a1a).

### Data Tables (Cards & Lists)
- **Rule:** Forbid all horizontal and vertical divider lines.
- **Structure:** Use `spacing-5` (1.1rem) of vertical white space between rows. Every second row should use a `surface_container_lowest` background to create a subtle "Zebra" striping that feels integrated, not forced.
- **Headers:** Use `label-md` in uppercase with 0.05em letter spacing for an architectural feel.

### Sidebar Command Center
- Use `inverse_surface` (#27313f) for the background.
- Active state: Use a vertical "light bar" of `primary` (#5f030a) on the far left, with the menu item background shifting to a semi-transparent `on_surface_variant`.

---

## 6. Do's and Don'ts

### Do
- **Do** use `primary` (#5f030a) sparingly. It is a "surgical" color used for high-importance alerts, brand accents, and primary CTAs.
- **Do** maximize the use of `spacing-8` and `spacing-10` to allow the data to breathe.
- **Do** use `Manrope` for any numerical data you want to emphasize (e.g., "58 Notifications").

### Don't
- **Don't** ever use a #000000 black shadow. Use a tinted shadow based on `on_surface`.
- **Don't** use standard "Success Green." Stick to the palette's sophisticated tones; use `tertiary` (#00313e) for positive reinforcement or "complete" states.
- **Don't** use 1px lines to separate sidebar navigation items. Use vertical spacing (`spacing-3`) to group and separate.