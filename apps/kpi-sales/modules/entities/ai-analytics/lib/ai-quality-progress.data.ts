import type { Tone } from '@workspace/april-ui';
import type { AiQualityProgressQuadrant } from '../model';

/**
 * Блок «качество × продвижение» (методика продаж, 02.11.2026): тексты и
 * тона клеток. Названия и смысл клеток приходят с бэка (quadrants), здесь —
 * только то, что бэку знать незачем: тон, подписи колонок, пустые
 * состояния. Правила владельца: по-русски, без кодов и формул.
 */

/** Тон клетки: сильная — успех, «купил бы и без менеджера» — предупреждение. */
export const AI_QUALITY_PROGRESS_TONE: Record<AiQualityProgressQuadrant, Tone> = {
    strong: 'success',
    quality_no_progress: 'info',
    progress_no_quality: 'warning',
    weak: 'destructive',
};

/** Тон клетки по коду; незнакомый код старого кэша — спокойный. */
export const aiQualityProgressTone = (code: string | null): Tone =>
    (AI_QUALITY_PROGRESS_TONE as Record<string, Tone | undefined>)[code ?? ''] ??
    'muted';

/** Продвижение сделки 1–5: 4.125 → «4,1 из 5»; null — «—». */
export const formatAiProgress5 = (value: number | null | undefined): string =>
    value === null || value === undefined
        ? '—'
        : `${value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} из 5`;

export const AI_QUALITY_PROGRESS_TEXT = {
    title: 'AI: качество × продвижение',
    description:
        'Каждый звонок с оценкой и продвижением сделки попадает в одну из четырёх клеток: качество разговора против того, продвинул ли звонок сделку.',
    loading: 'Считаем клетки…',
    empty:
        'Разборов с продвижением сделки за период пока нет: продвижение считает разбор новой версии, данные появятся после первых таких разборов.',
    thresholds: (qualityScoreMin: number, progressMovingMin: number): string =>
        `Качество — оценка от ${qualityScoreMin.toLocaleString('ru-RU')} из 10; движение сделки — продвижение от ${progressMovingMin.toLocaleString('ru-RU')} из 5.`,
    columns: {
        manager: 'Сотрудник',
        n: 'Звонков',
        score: 'Оценка',
        progress: 'Продвижение',
        position: 'Клетка',
    },
    nHint: {
        title: 'Звонков с продвижением',
        lines: [
            'Считаются только звонки, у которых есть и оценка разбора, и продвижение сделки.',
            'Клетка по средним показывается от 8 таких звонков.',
        ],
    },
    positionHint: {
        title: 'Клетка по средним',
        lines: [
            'Средняя оценка и среднее продвижение сотрудника против порогов портала.',
            'Числа в колонках клеток — сколько звонков попало в каждую.',
        ],
    },
    fewData: 'мало данных',
    totals: 'Итого по выбранным',
    openCalls: (count: number): string =>
        `звонков «купил бы и без менеджера»: ${count.toLocaleString('ru-RU')}`,
} as const;
