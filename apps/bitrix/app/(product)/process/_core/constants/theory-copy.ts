/**
 * Подписи справочных блоков теории. Ни строки текста в .tsx — всё здесь.
 */

import type { TheoryReadiness, TheoryScreenAspect } from '../theory-types';

/** Префикс подписи места под скрин: «СКРИН: карточка разбора». */
export const THEORY_SCREEN_PREFIX = 'СКРИН';

/**
 * Пустое место под скрин («СКРИН: …» в пунктирной рамке) — подсказка тому,
 * кто снимает скрины, а не читателю сайта: на проде без картинки места нет
 * (то же правило, что у кадров раздела «Платформа»).
 */
export const SHOW_THEORY_SCREEN_PLACEHOLDERS =
    process.env.NODE_ENV !== 'production';

/** Рисовать ли место под скрин: есть картинка или идёт разработка. */
export const isTheoryScreenShown = (
    screen: { src?: string },
    showPlaceholders: boolean = SHOW_THEORY_SCREEN_PLACEHOLDERS,
): boolean => Boolean(screen.src) || showPlaceholders;

/** Классы соотношения сторон места под скрин. */
export const THEORY_SCREEN_ASPECT_CLASS: Record<TheoryScreenAspect, string> = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    phone: 'mx-auto aspect-[9/16] max-w-xs',
};

/** Подписи и тон плашки готовности. */
export const THEORY_READINESS: Record<
    TheoryReadiness,
    { label: string; className: string }
> = {
    live: {
        label: 'Работает',
        className: 'border-success/40 bg-success/10 text-success',
    },
    wip: {
        label: 'В работе',
        className: 'border-warning/50 bg-warning/10 text-warning',
    },
    open: {
        label: 'Открыто',
        className: 'border-border bg-muted/40 text-muted-foreground',
    },
};

/** Подсказка к плашке готовности: о чём говорит состояние. */
export const THEORY_READINESS_HINT: Record<TheoryReadiness, string> = {
    live: 'Описанное здесь работает на портале сейчас',
    wip: 'Описанное здесь делается; текст будет уточнён',
    open: 'Решение ещё не принято; описан вопрос, а не ответ',
};
