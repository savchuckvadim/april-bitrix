'use client';

import type { AiSettingsTab } from '../../lib/ai-settings-form.util';
import { AI_EMPLOYEE_SETTINGS_SECTIONS } from '../../lib/ai-tabs';
import { AiSignalTable } from '../AiSignalTable';
import { AiKpiOnlyNote } from '../components/AiKpiOnlyNote';
import { AiSettingsInline } from '../components/AiSettingsInline';

interface AiEmployeesTabProps {
    /** Руководитель op/cup: раскрытые секции настроек по людям. */
    canConfigure: boolean;
    /** В kpi-only обзор не считается — таблицы нет, пояснение. */
    kpiOnly: boolean;
    /** Секция настроек из URL, к которой прокрутить. */
    focusSection: AiSettingsTab | null;
}

/**
 * Подвкладка «Сотрудники»: таблица сигналов по менеджерам и — тому, кто
 * настраивает витрину, — раскрытые секции «Уровни», «Цели по уровням»,
 * «Отсутствия», «Состав» с общей кнопкой сохранения (прежде жили в
 * диалоге настроек).
 */
export const AiEmployeesTab = ({ canConfigure, kpiOnly, focusSection }: AiEmployeesTabProps) => (
    <>
        {kpiOnly ? <AiKpiOnlyNote /> : <AiSignalTable />}
        {canConfigure && (
            <AiSettingsInline
                kind="employees"
                sections={AI_EMPLOYEE_SETTINGS_SECTIONS}
                focusSection={focusSection}
            />
        )}
    </>
);
