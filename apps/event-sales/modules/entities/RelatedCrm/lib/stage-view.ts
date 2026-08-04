import type { RelatedStage } from '../model';

/**
 * Как показывать стадию сделки. Данные отдельно от вёрстки.
 *
 * Всё берётся из настроек воронки портала (`color`, `order`, `total`), а не из
 * палитры фронта: менеджер должен видеть ту же расцветку, что и в своей
 * воронке в Битриксе. Нет порядка стадии — ничего не рисуем: показать позицию
 * наугад хуже, чем не показать.
 */

/**
 * Сумма сделки для показа рядом со стадией.
 *
 * Валюты в ответе нет — портальные сделки ведутся в рублях, поэтому знак
 * ставим фиксированный. Появится валюта в DTO — правится только здесь.
 */
export const dealAmount = (opportunity?: number): string | null => {
    if (!opportunity) return null;
    return `${new Intl.NumberFormat('ru-RU').format(opportunity)} ₽`;
};

/** Доля пройденной воронки: 0…1. */
export const stageProgress = (stage: RelatedStage): number | null => {
    if (stage.order === undefined || stage.order === null || !stage.total) {
        return null;
    }
    return Math.min(1, (stage.order + 1) / stage.total);
};

/** Цвет стадии из настроек портала; нет цвета — нейтральная подложка. */
export const stageColor = (stage: RelatedStage): string | undefined => {
    const color = stage.color?.trim();
    if (!color) return undefined;
    return color.startsWith('#') ? color : `#${color}`;
};

/** Подпись «3 / 8» — без неё сегменты миниатюры не читаются. */
export const stagePositionLabel = (stage: RelatedStage): string | null => {
    if (stage.order === undefined || stage.order === null || !stage.total) {
        return null;
    }
    return `${stage.order + 1} / ${stage.total}`;
};

/**
 * Миниатюра: воронка как ряд сегментов, пройденные закрашены.
 *
 * Полоска-прогресс отвечает «насколько далеко», сегменты — «на каком шаге из
 * скольких». На маленькой площади второе читается быстрее: видно и позицию, и
 * длину воронки.
 */
export interface StageSegment {
    isFilled: boolean;
    isCurrent: boolean;
}

/** Больше сегментов на такой ширине уже не различить — сжимаем воронку. */
const MAX_SEGMENTS = 12;

export const stageSegments = (stage: RelatedStage): StageSegment[] => {
    const total = stage.total ?? 0;
    if (!total || stage.order === undefined || stage.order === null) return [];

    const shown = Math.min(total, MAX_SEGMENTS);
    // При сжатии позицию пересчитываем пропорционально: иначе на длинной
    // воронке текущий шаг всегда упирался бы в правый край.
    const currentIndex = Math.min(
        shown - 1,
        Math.round((stage.order / Math.max(1, total - 1)) * (shown - 1)),
    );

    return Array.from({ length: shown }, (_, index) => ({
        isFilled: index <= currentIndex,
        isCurrent: index === currentIndex,
    }));
};
