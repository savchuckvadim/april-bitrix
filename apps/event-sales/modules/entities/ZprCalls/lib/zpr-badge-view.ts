import type { ZprStageDict } from '../model';

/**
 * Бейдж стадии вне лестницы (провалы zpr_noresult/zpr_fail) — данные отдельно
 * от вёрстки, палитра та же, что у семантических бейджей лидов.
 */
export interface ZprStageBadgeView {
    label: string;
    className: string;
}

const SEMANTIC_CLASS: Record<'P' | 'S' | 'F', string> = {
    P: 'bg-warning/15 text-warning',
    S: 'bg-success/15 text-success',
    F: 'bg-destructive/15 text-destructive',
};

/**
 * Вид бейджа для стадии, которой нет в лестнице пути: имя стадии из полного
 * словаря + окраска по семантике. Стадия неизвестна словарю или словарь ещё
 * не приехал — null: рисовать нечего (наугад хуже, чем никак).
 */
export const getZprStageBadge = (
    dict: ZprStageDict | undefined,
    stageId: string,
): ZprStageBadgeView | null => {
    const stage = dict?.all.find(item => item.statusId === stageId);
    if (!stage) return null;
    return {
        label: stage.name,
        className:
            SEMANTIC_CLASS[stage.semantics ?? 'P'] ?? SEMANTIC_CLASS.P,
    };
};
