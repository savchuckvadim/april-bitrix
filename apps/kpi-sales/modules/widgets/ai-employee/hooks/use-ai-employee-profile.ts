'use client';

import { useMemo } from 'react';
import {
    AI_MATRIX_BLOCK_TEXT,
    buildAiProfileChart,
    useAiSectionsMatrix,
    useAiTypesMatrix,
    type AiProfileChart,
} from '@/modules/widgets/ai-analytics-report';

export interface AiEmployeeProfile {
    chart: AiProfileChart;
    /** Сотрудник есть в таблице периода (вторая серия рядом со средним по отделу). */
    present: boolean;
    /** «корзинам звонков» / «типам звонков» / «разделам разговора». */
    columnsLabel: string;
}

const profileOf = (chart: AiProfileChart, columnsLabel: string): AiEmployeeProfile => ({
    chart,
    present: chart.series.length > 1,
    columnsLabel,
});

/**
 * Профиль сотрудника против среднего по отделу для подвкладки «Качество»:
 * те же матрицы, что блоки «AI: типы звонков» и «AI: разделы оценки по
 * типу» вкладки AI (срез «все типы» в периметре отчёта, очередь + WS),
 * серия сотрудника — его строка, серия отдела — итоги матрицы.
 */
export const useAiEmployeeProfile = (managerId: string) => {
    const types = useAiTypesMatrix();
    const sections = useAiSectionsMatrix();

    const typesProfile = useMemo(
        () =>
            profileOf(
                buildAiProfileChart(types.summaryTable, managerId),
                AI_MATRIX_BLOCK_TEXT.chart.columns[types.mode],
            ),
        [types.summaryTable, types.mode, managerId],
    );
    const sectionsProfile = useMemo(
        () =>
            profileOf(
                buildAiProfileChart(sections.summaryTable, managerId),
                AI_MATRIX_BLOCK_TEXT.chart.columns.sections,
            ),
        [sections.summaryTable, managerId],
    );

    return {
        section: types.section,
        isReady: types.isReady,
        types: typesProfile,
        sections: sectionsProfile,
    };
};
