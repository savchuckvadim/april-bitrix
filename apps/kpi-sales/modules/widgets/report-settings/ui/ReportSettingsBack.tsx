'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconAction } from '@workspace/april-ui';
// Прямой путь, не index фичи: нужен только разбор адреса (без стора и UI).
import {
    parseReportSettingsFrom,
    REPORT_SETTINGS_FROM_PARAM,
} from '@/modules/feature/portal-view/lib/report-settings-nav';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import { canStepBackInHistory, reportSettingsBackTarget } from '../lib/report-settings-back';

/**
 * Стрелка «назад» в шапке настроек: возвращает на страницу, с которой
 * настройки открыли, — в отчёт или в «Разборы звонков». Если настройки
 * открыты кнопкой приложения, это шаг назад по истории окна: список разборов
 * откроется с теми же фильтрами. Вид — как у стрелки на странице сотрудника.
 */
export const ReportSettingsBack = () => {
    const router = useRouter();
    const from = parseReportSettingsFrom(
        useSearchParams().get(REPORT_SETTINGS_FROM_PARAM),
    );
    const target = reportSettingsBackTarget(from);

    const goBack = () => {
        if (canStepBackInHistory(from, window.history.length)) router.back();
        else router.push(target.path);
    };

    return (
        <IconAction
            icon={ArrowLeft}
            label={REPORT_SETTINGS_TEXT.back.label}
            hint={target.hint}
            onClick={goBack}
            size="md"
            side="bottom"
            align="start"
            className="ml-1 text-primary hover:text-primary/80"
        />
    );
};
