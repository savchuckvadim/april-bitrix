'use client';

import { useMemo } from 'react';
import type { PortalViewIndicator } from '@/modules/feature/portal-view';
import { useLoadedEnabledPlanCodes } from '@/modules/feature/plans';
import {
    labelGroupViews,
    planColumnRowViews,
} from '../lib/report-settings-indicator-rows';
import {
    anyPlanColumnsSwitchOn,
    type ReportSettingsIndicatorsForm,
} from '../lib/report-settings-indicators';

/**
 * Раздел «Показатели»: строки своих названий и планов-колонок из каталога
 * портала и формы. Свои названия из формы действуют на подписи раздела
 * сразу, до сохранения. Включённость в настройках планов — из стора планов,
 * если отчёт их уже загрузил (сам раздел их не грузит).
 */
export const useReportSettingsIndicators = (
    form: ReportSettingsIndicatorsForm,
    indicators: readonly PortalViewIndicator[],
) => {
    const enabledPlanCodes = useLoadedEnabledPlanCodes();
    const labelGroups = useMemo(
        () => labelGroupViews(indicators, form),
        [indicators, form],
    );
    const planRows = useMemo(
        () => planColumnRowViews(indicators, form, enabledPlanCodes),
        [indicators, form, enabledPlanCodes],
    );
    return {
        /** Каталог прочитан: пустой — бэк не прочитал портал. */
        hasCatalog: indicators.length > 0,
        labelGroups,
        planRows,
        /** Колонки планов включены хотя бы на одной вкладке. */
        anySwitchOn: anyPlanColumnsSwitchOn(form),
    };
};
