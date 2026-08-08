import type { RelatedStage } from '../model';

/**
 * Как показывать стадию сделки. Данные отдельно от вёрстки.
 *
 * Позиция (`order`/`total`) берётся из настроек воронки портала. Полоска
 * прогресса красится градиентом токенов --deal-stage-* (решение владельца:
 * единая палитра фронта во всех встройках); портальный `color` остаётся для
 * точечных акцентов (точка-статус в StageBar). Нет порядка стадии — ничего
 * не рисуем: показать позицию наугад хуже, чем не показать.
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

