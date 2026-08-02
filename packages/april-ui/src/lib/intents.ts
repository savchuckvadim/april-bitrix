/**
 * @deprecated Легаси-слой имён из старого event-UI. Новый код берёт тона
 * напрямую из `./tones` (`Tone`, `TONE_SOLID`, `TONE_SOFT`, `TONE_BG`).
 * Живёт ради `AAButton`, `ABadge`, `ATogglerColor`, принимающих брендовые
 * названия цветов (`april`, `fiolet`, `danger`, …).
 *
 * Здесь была своя таблица классов, где success/warning/info были завязаны на
 * палитру графиков (`bg-chart-2`, `bg-chart-4`, `bg-chart-1`) — она появилась
 * до того, как в april-tokens.css завели настоящие --success/--warning/--info.
 * Из-за этого статусы в легаси-компонентах красились не тем же цветом, что во
 * всей остальной монорепе. Теперь это тонкая обёртка над единым реестром,
 * и расхождение невозможно.
 */

import { TONE_BG, TONE_SOFT, TONE_SOLID, type Tone } from './tones';

export type Intent = Extract<
    Tone,
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'neutral'
    | 'muted'
    | 'success'
    | 'warning'
    | 'info'
    | 'destructive'
>;

/** Легаси-название цвета → семантический тон. */
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

export const intentOf = (color: string): Intent =>
    (LEGACY_COLOR_INTENT as Record<string, Intent>)[color] ?? 'primary';

export const solid = (color: string) => TONE_SOLID[intentOf(color)];
export const soft = (color: string) => TONE_SOFT[intentOf(color)];
export const bg = (color: string) => TONE_BG[intentOf(color)];

/** @deprecated Используйте `TONE_SOLID` из `./tones`. */
export const INTENT_SOLID = TONE_SOLID;
/** @deprecated Используйте `TONE_SOFT` из `./tones`. */
export const INTENT_SOFT = TONE_SOFT;
/** @deprecated Используйте `TONE_BG` из `./tones`. */
export const INTENT_BG = TONE_BG;
