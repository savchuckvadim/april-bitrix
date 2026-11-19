import type { RootState } from '@/modules/app/model/store';
import { selectRealUser } from '@/modules/app/model/selectors';

/**
 * Список разборов спрашивается от имени РЕАЛЬНОГО пользователя, не
 * «Смотреть как…»: личные ссылки с правом на отзыв выпускаются на того, кто
 * спрашивает, а отзыв подписывается его именем. Поэтому суперпользователь в
 * режиме просмотра чужого отчёта оценивает звонки как суперпользователь.
 * Тот же пользователь стоит в сессии портала — guard бэка его и сверяет.
 */
export const selectCallsListDomain = (state: RootState): string | null =>
    state.app.isPublic ? null : state.app.domain || null;

/** Bitrix-id реального пользователя фрейма; нет — null. */
export const selectCallsListUserId = (state: RootState): string | null => {
    const id = selectRealUser(state)?.ID;
    return id ? String(id) : null;
};
