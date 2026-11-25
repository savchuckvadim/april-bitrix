'use client';

import { Settings } from 'lucide-react';
import { HeaderAction } from '@/modules/shared';
import { PORTAL_VIEW_TEXT } from '../consts/portal-view.texts';
import { useCanEditPortalView } from '../hooks/use-portal-view';
import { reportSettingsHref, type ReportSettingsFrom } from '../lib/report-settings-nav';

interface ReportSettingsLinkProps {
    /**
     * С какой страницы открывают настройки: туда вернёт стрелка «назад» в
     * шапке настроек. По умолчанию — из отчёта.
     */
    from?: ReportSettingsFrom;
}

/**
 * Кнопка-иконка «Настройки отчёта» в шапке: ведёт на страницу настроек.
 * Видна только тому, кто может менять настройки (руководитель группы и выше,
 * суперпользователь) и не в режиме «Смотреть как…».
 */
export const ReportSettingsLink = ({ from = 'report' }: ReportSettingsLinkProps) => {
    const canEdit = useCanEditPortalView();
    if (!canEdit) return null;

    return (
        <HeaderAction
            icon={Settings}
            label={PORTAL_VIEW_TEXT.settingsLink}
            hint={PORTAL_VIEW_TEXT.settingsHint}
            href={reportSettingsHref(from)}
        />
    );
};
