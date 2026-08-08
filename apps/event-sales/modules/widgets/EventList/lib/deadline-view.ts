import {
    EVENT_STATUS_BADGE,
    type EventDeadlineStatus,
} from '@workspace/april-ui';

/**
 * Срок в строке карточки: приставка и цвет текста вместо отдельного бэйджа
 * статуса. «Запланирован» не показываем вовсе — цвет остаётся только у
 * проблемных сроков, спокойные карточки молчат.
 *
 * Warning подмешан к foreground той же формулой, что TONE_SOFT: чистый
 * янтарный на светлом фоне текстом не читается.
 */
export const DEADLINE_VIEW: Record<
    EventDeadlineStatus,
    { prefix: string; className: string }
> = {
    no: { prefix: '', className: 'text-muted-foreground' },
    almost: {
        prefix: `${EVENT_STATUS_BADGE.almost.label} · `,
        // Хинт `color:` обязателен: без него tailwind-merge считает класс
        // font-size'ом и выкидывает text-xs строки срока (см. tones.ts).
        className:
            'font-medium text-[color:color-mix(in_oklab,var(--warning),var(--foreground)_35%)]',
    },
    yes: {
        prefix: `${EVENT_STATUS_BADGE.yes.label} · `,
        className: 'font-medium text-destructive',
    },
};
