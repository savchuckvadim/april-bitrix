/**
 * Design-system intents — pure className helpers over the ALREADY-CONFIGURED theme
 * tokens (@workspace/april-theme): primary / secondary / accent / muted / destructive
 * and the chart palette (chart-1..5). No new CSS, no parallel theme — a sibling app
 * restyles by swapping the configured theme only.
 *
 * The legacy event UI used brand-ish color names (april, blue, fiolet, orange,
 * danger, success...). Every name maps onto a semantic intent backed by a theme token.
 */

export type Intent =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'muted'
    | 'success'
    | 'warning'
    | 'info'
    | 'destructive';

/** Legacy color name -> semantic intent. */
export const LEGACY_COLOR_INTENT = {
    april: 'primary',
    blue: 'info',
    bxblue: 'info',
    dblue: 'info',
    green: 'success',
    success: 'success',
    orange: 'warning',
    warning: 'warning',
    yellow: 'warning',
    danger: 'destructive',
    fiolet: 'accent',
    light: 'muted',
    grey: 'muted',
    dark: 'secondary',
} as const satisfies Record<string, Intent>;

export type LegacyColor = keyof typeof LEGACY_COLOR_INTENT;

// Status intents (success/warning/info) reuse the configured chart palette so they
// follow the active theme. danger -> destructive (semantic).
export const INTENT_SOLID: Record<Intent, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/80',
    muted: 'bg-muted text-muted-foreground hover:bg-muted/80',
    success: 'bg-chart-2 text-background hover:bg-chart-2/90',
    warning: 'bg-chart-4 text-background hover:bg-chart-4/90',
    info: 'bg-chart-1 text-background hover:bg-chart-1/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

export const INTENT_SOFT: Record<Intent, string> = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent/60 text-accent-foreground',
    muted: 'bg-muted text-muted-foreground',
    success: 'bg-chart-2/15 text-chart-2',
    warning: 'bg-chart-4/15 text-chart-4',
    info: 'bg-chart-1/15 text-chart-1',
    destructive: 'bg-destructive/10 text-destructive',
};

export const INTENT_BG: Record<Intent, string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    muted: 'bg-muted-foreground',
    success: 'bg-chart-2',
    warning: 'bg-chart-4',
    info: 'bg-chart-1',
    destructive: 'bg-destructive',
};

export const intentOf = (color: string): Intent =>
    (LEGACY_COLOR_INTENT as Record<string, Intent>)[color] ?? 'primary';

export const solid = (color: string) => INTENT_SOLID[intentOf(color)];
export const soft = (color: string) => INTENT_SOFT[intentOf(color)];
export const bg = (color: string) => INTENT_BG[intentOf(color)];
