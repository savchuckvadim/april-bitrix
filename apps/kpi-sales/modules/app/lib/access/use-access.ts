'use client';

import { useAppSelector } from '../hooks/redux';
import {
    AccessContext,
    checkAccess,
    EAccessFeature,
} from '@/modules/shared/access';
import { isSuperUser } from '@/modules/entities/department/lib/utils/super-user';
import { resolveVisibility } from '@/modules/entities/department/lib/utils/visibility.util';
import type { RootState } from '../../model/store';
import { selectEffectiveUser, selectIsViewAs } from '../../model/selectors';

/**
 * Мост «стор → контекст прав». Правила лежат в shared/access (чистые),
 * здесь только сборка контекста из слайсов. App-слой выбран местом моста
 * сознательно: его хуки уже импортируют все слои (useAppSelector), и он
 * единственный знает форму всего стора — boundaries не нарушаются.
 */
export const selectAccessContext = (state: RootState): AccessContext => {
    const realUser = state.app.bitrix.user;
    const effectiveUser = selectEffectiveUser(state);
    const isViewAs = selectIsViewAs(state);
    const currentUser = state.department.currentUser;
    return {
        features: state.app.features,
        headOf: currentUser?.headOf ?? null,
        // В режиме viewAs суперюзерский бонус эффективного юзера гасится —
        // права считаются честно по роли просматриваемого.
        isSuperUser: !isViewAs && isSuperUser(effectiveUser),
        isRealSuperUser: isSuperUser(realUser),
        isViewAs,
        isMulti: state.department.isMulti,
        // Рядовой менеджер структуры: периметр «только себя».
        isSelf:
            currentUser !== null && resolveVisibility(currentUser) === 'own',
    };
};

/** Текущий контекст прав (реактивно). */
export const useAccessContext = (): AccessContext =>
    useAppSelector(selectAccessContext);

/**
 * Центральная проверка доступа для любых entity/фич/виджетов:
 *   const canFinance = useAccess(EAccessFeature.FINANCE_TAB);
 * Настройка «кому что видно» — только в shared/access/access.rules.ts.
 */
export const useAccess = (feature: EAccessFeature): boolean => {
    const ctx = useAccessContext();
    return checkAccess(feature, ctx);
};
