# april-ui — Design System

Shared UI for the event apps (`event-service`, `event-sales`, and future siblings).
Built **only** on Tailwind + shadcn (`@workspace/ui`) + the theme tokens from
`@workspace/april-theme`. No reactstrap, no Bootstrap, no `.module.scss`, no
hardcoded colors.

## Principles

1. **Theme tokens only.** Components reference semantic tokens (`primary`,
   `secondary`, `muted`, `accent`, `destructive`, `card`, `border`, `ring`…),
   never raw palette values (`bg-blue-500`). A sibling app restyles the entire
   library by swapping the theme — zero component edits.
2. **shadcn primitives** come from `@workspace/ui/components/*`
   (button, input, select, dialog, badge, card, label, checkbox, tooltip,
   progress, textarea, table…). Compose, don't reinvent.
3. **Unified form fields** come from `@workspace/ui/shared`
   (`Field`, `FieldInput`, `FormField`, `FormFieldInput`). Event inputs wrap these.
4. **`cn()`** from `@workspace/ui/lib/utils` for class composition.

## Intent layer (`src/lib/intents.ts`)

Pure className helpers over the **already-configured** theme tokens
(`@workspace/april-theme`) — no new CSS, no parallel theme. The legacy event UI used
brand-ish color names (`april`, `blue`, `fiolet`, `orange`, `danger`, `success`…);
every name maps onto a semantic intent backed by an existing token:

| Legacy name              | Intent        | Token base       |
| ------------------------ | ------------- | ---------------- |
| `april`                  | `primary`     | `--primary`      |
| `blue` `bxblue` `dblue`  | `info`        | `--chart-1`      |
| `green` `success`        | `success`     | `--chart-2`      |
| `orange` `warning` `yellow` | `warning`  | `--chart-4`      |
| `danger`                 | `destructive` | `--destructive`  |
| `fiolet`                 | `accent`      | `--accent`       |
| `light` `grey`           | `muted`       | `--muted`        |
| `dark`                   | `secondary`   | `--secondary`    |

Status intents reuse the configured **chart palette** (`chart-1..5`), so they follow
the active theme (default/blue/violet, light/dark). A sibling app recolors statuses by
swapping the theme — no component or intent changes.

Helpers: `solid(color)` (filled), `soft(color)` (tinted badge/label),
`bg(color)` (bar/fill background). Used by `AAButton`, `ABadge`, `ATogglerColor`.

## Setup in an app

Themes are wired the standard way (как в konstructor) — `NextThemesProvider` +
`AprilThemeProvider` in the app providers; `@workspace/ui/globals.css` in the layout.
Nothing extra to import for april-ui:

```tsx
import { EVCard, AButton, ABadge, AInput } from '@workspace/april-ui';
```

## Component inventory

- **Form:** `AInput` (→ `FieldInput`), `AText` (→ shadcn Textarea), `ALabel`,
  `ASelect`, `ADate`, `APhoneInput`, `ACheckboxGroup`.
- **Display:** `EVCard` (card + shadcn Tooltip), `EventCardAction`, `ABadge`,
  `AButton`, `ALink`, `AIcon`, `ATogglerColor`, `Page`, `AModal` (→ shadcn Dialog).
- **Feedback:** `Preloader`, `PreloaderMicro`, `PreloaderCard`.

## Reuse in a sibling app

Because all color/spacing/radius comes from theme + intent tokens, a new
"same-but-different" app:
1. depends on `@workspace/april-ui`,
2. ships its own `@workspace/april-theme` token values (brand colors),
3. optionally overrides `--success/--warning/--info`.

No component code changes.
