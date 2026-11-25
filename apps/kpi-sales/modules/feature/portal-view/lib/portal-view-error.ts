// Прямые пути: нужны только утилиты разбора ошибки, без барелей сущности.
import {
    aiErrorMessage,
    aiErrorStatus,
} from '@/modules/entities/ai-analytics/lib/ai-error.util';
import { PORTAL_VIEW_TEXT } from '../consts/portal-view.texts';

const HTTP_FORBIDDEN = 403;

/**
 * Ошибка сохранения → текст для человека: 403 — «меняет руководитель группы
 * и выше»; понятный (русский) текст сервера или ошибки — как есть; остальное —
 * общий запасной текст без кодов и «status code».
 */
export function portalViewSaveErrorMessage(error: unknown): string {
    if (aiErrorStatus(error) === HTTP_FORBIDDEN) {
        return PORTAL_VIEW_TEXT.errors.forbidden;
    }
    return aiErrorMessage(error, PORTAL_VIEW_TEXT.errors.saveFailed);
}
