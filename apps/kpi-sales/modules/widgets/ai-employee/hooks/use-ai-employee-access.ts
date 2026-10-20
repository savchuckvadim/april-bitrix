'use client';

import { useAccess, useAppSelector } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { selectAiRequester } from '@/modules/entities/ai-analytics';
import { resolveAiEmployeeAccess } from '../lib/ai-employee-access.util';

/**
 * Доступ к AI-разделу страницы сотрудника: право на вкладку AI и либо
 * право видеть всех (руководитель), либо своя страница («вижу себя»).
 * Чужого сотрудника вне периметра руководителя отсекает сервер (403 —
 * текст в секциях).
 */
export const useAiEmployeeAccess = (managerId: string) => {
    const canTab = useAccess(EAccessFeature.AI_TAB);
    const canViewAll = useAccess(EAccessFeature.AI_VIEW_ALL);
    const requesterId = useAppSelector(
        state => selectAiRequester(state)?.requesterUserId ?? null,
    );
    return {
        ...resolveAiEmployeeAccess({ canTab, canViewAll, requesterId, managerId }),
        canViewAll,
    };
};
