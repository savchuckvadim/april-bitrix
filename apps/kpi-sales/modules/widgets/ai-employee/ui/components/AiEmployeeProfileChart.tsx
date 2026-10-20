'use client';

import { Bar } from 'react-chartjs-2';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import { SectionCard } from '@workspace/april-ui';
import {
    aiProfileChartData,
    aiProfileChartOptions,
} from '@/modules/widgets/ai-analytics-report';
import type { AiEmployeeProfile } from '../../hooks/use-ai-employee-profile';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AiEmployeeProfileChartProps {
    profile: AiEmployeeProfile;
}

const T = AI_EMPLOYEE_TEXT.quality.profile;

/**
 * Профиль сотрудника по колонкам матрицы (корзины, типы или разделы)
 * рядом со средним по отделу; ось 0..10. Сотрудника нет в таблице периода
 * (разборов нет) — честная подпись вместо графика.
 */
export const AiEmployeeProfileChart = ({ profile }: AiEmployeeProfileChartProps) => (
    <SectionCard
        surface="glass"
        title={T.title(profile.columnsLabel)}
        description={T.description}
    >
        {!profile.present ? (
            <p className="py-2 text-xs text-muted-foreground">{T.missing}</p>
        ) : profile.chart.hasScores ? (
            <div style={{ height: '280px' }}>
                <Bar
                    data={aiProfileChartData(profile.chart)}
                    options={aiProfileChartOptions(profile.chart)}
                />
            </div>
        ) : (
            <p className="py-2 text-xs text-muted-foreground">{T.empty}</p>
        )}
    </SectionCard>
);
