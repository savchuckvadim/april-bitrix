import type { PBXFieldItem } from '@/modules/app/types/portal/portal-type';
import { PROSPECT_SCALE, type CompanyColorType } from './event-company-util';

/** Ступень шкалы прогноза для StepChoiceBar/LiquidChoiceBar. */
export interface ProspectStepView {
    code: CompanyColorType;
    label: string;
    color: string;
}

/**
 * Подписи ступеней берём из ПОРТАЛЬНОГО поля (на портале значение может
 * называться по-своему), а порядок и цвет — из локальной шкалы: она и есть
 * смысл прогноза, портал его не задаёт.
 */
export const getProspectSteps = (
    items: PBXFieldItem[] | null | undefined,
): ProspectStepView[] =>
    PROSPECT_SCALE.map(step => ({
        code: step.code,
        label: getProspectName(items, step.code),
        color: step.cssColor,
    }));

/** Название значения прогноза: портальное, иначе локальное из шкалы. */
export const getProspectName = (
    items: PBXFieldItem[] | null | undefined,
    code: string | null | undefined,
): string => {
    if (!code) return '';
    const portalName = items?.find(item => item.code === code)?.name;
    if (portalName) return portalName;
    return PROSPECT_SCALE.find(step => step.code === code)?.name ?? '';
};

export interface ProspectCaptionInput {
    /** Ошибка записи прогноза — она сильнее любой подписи. */
    error?: string;
    /** Название текущего значения; пусто — прогноз не задан. */
    currentName?: string;
    /** Название значения под курсором/фокусом; пусто — превью нет. */
    previewName?: string;
}

/**
 * Подпись рядом со шкалой.
 *
 * Одной строкой отвечает на оба вопроса окна предпроверки: что стоит СЕЙЧАС
 * и что станет, если нажать на ступень под курсором. Раньше подпись знала
 * только текущее значение, а заливка шкалы под курсором подменялась превью —
 * и «что стоит» узнать было негде.
 */
export const getProspectCaption = ({
    error,
    currentName,
    previewName,
}: ProspectCaptionInput): string => {
    if (error) return error;
    const now = currentName ? `Сейчас: ${currentName}` : 'Прогноз не задан';
    if (!previewName || previewName === currentName) return now;
    return `${now} → ${previewName}`;
};
