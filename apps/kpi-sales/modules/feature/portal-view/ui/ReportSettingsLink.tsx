'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
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

    const label = PORTAL_VIEW_TEXT.settingsLink;
    return (
        <Button
            asChild
            variant="outline"
            className="h-8 cursor-pointer px-3"
            title={label}
        >
            <Link href={REPORT_SETTINGS_PATH} aria-label={label}>
                <Settings />
            </Link>
        </Button>
    );
};
