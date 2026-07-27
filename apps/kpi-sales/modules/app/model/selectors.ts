import type { BXUser } from '@workspace/bx';
import type { RootState } from './store';

/** Реальный пользователь фрейма (никогда не подменяется режимом viewAs). */
export const selectRealUser = (state: RootState): BXUser | null =>
    state.app.bitrix.user;

/**
 * Эффективный пользователь: в режиме «Смотреть как…» — просматриваемый,
 * иначе реальный. От его имени грузятся данные (структура, фильтр, отчёты);
 * все user-keyed ЗАПИСИ при активном viewAs заблокированы гардами.
 */
export const selectEffectiveUser = (state: RootState): BXUser | null =>
    state.app.viewAs.user ?? state.app.bitrix.user;

/** Активен ли режим «Смотреть как…». */
export const selectIsViewAs = (state: RootState): boolean =>
    state.app.viewAs.user !== null;

/** Публичный read-only снимок (/share): без ссылок на user-report и т.п. */
export const selectIsPublic = (state: RootState): boolean =>
    state.app.isPublic;
