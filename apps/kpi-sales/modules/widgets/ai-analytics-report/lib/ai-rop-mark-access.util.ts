import { AI_ROP_MARK_VIEW_AS_HINT } from './ai-rop-mark-state.util';

/*
 * Кто может писать в слепой оценке (чистая логика карточки rop-mark).
 * Бэк отвечает 403 на метку и «Подобрать заново» суперпользователю
 * вендора — ставить метки и пересобирать подбор могут только
 * руководители портала. Такие кнопки ему не показываем вовсе.
 */

/** Строка над подбором для суперпользователя вендора. */
export const AI_ROP_MARK_SUPER_USER_HINT =
    'Вы видите слепую проверку как суперпользователь вендора — метки ставят руководители портала';

export interface AiRopMarkAccess {
    /**
     * Режим «Смотреть как…»: кнопки записи видны, но неактивны с этой
     * подсказкой; null — подсказки нет.
     */
    readOnlyHint: string | null;
    /**
     * Суперпользователь вендора (не в «Смотреть как…»): кнопки записи
     * скрыты, над подбором — эта строка; null — обычный руководитель.
     */
    superUserHint: string | null;
    /**
     * Показывать кнопки записи: форму метки, «Изменить метку», «Подобрать
     * заново». В «Смотреть как…» они видны, но неактивны.
     */
    showWriteControls: boolean;
}

/** Звонок без метки, когда ставить метку нельзя (суперпользователь). */
export const AI_ROP_MARK_NO_MARK_TEXT = 'Руководитель ещё не поставил метку';

/**
 * Режим записи карточки. «Смотреть как…» важнее: в нём права считаются
 * по роли просматриваемого, а флаг суперпользователя реального
 * пользователя не действует.
 */
export const aiRopMarkAccess = (
    isViewAs: boolean,
    isRealSuperUser: boolean,
): AiRopMarkAccess => {
    if (isViewAs) {
        return {
            readOnlyHint: AI_ROP_MARK_VIEW_AS_HINT,
            superUserHint: null,
            showWriteControls: true,
        };
    }
    if (isRealSuperUser) {
        return {
            readOnlyHint: null,
            superUserHint: AI_ROP_MARK_SUPER_USER_HINT,
            showWriteControls: false,
        };
    }
    return { readOnlyHint: null, superUserHint: null, showWriteControls: true };
};
