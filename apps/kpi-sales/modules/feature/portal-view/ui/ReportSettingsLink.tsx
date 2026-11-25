'use client';

import { Settings } from 'lucide-react';
import { HeaderAction } from '@/modules/shared';
import { REPORT_SETTINGS_PATH } from '../consts/portal-view.consts';
import { PORTAL_VIEW_TEXT } from '../consts/portal-view.texts';
import { useCanEditPortalView } from '../hooks/use-portal-view';

/**
 * Кнопка-иконка «Настройки отчёта» в шапке: ведёт на страницу настроек.
 * Видна только тому, кто может менять настройки (руководитель группы и выше,
 * суперпользователь) и не в режиме «Смотреть как…».
 */
export const ReportSettingsLink = () => {
    const canEdit = useCanEditPortalView();
    if (!canEdit) return null;

    return (
        <HeaderAction
            icon={Settings}
            label={PORTAL_VIEW_TEXT.settingsLink}
            hint={PORTAL_VIEW_TEXT.settingsHint}
            href={REPORT_SETTINGS_PATH}
        />
    );
};
