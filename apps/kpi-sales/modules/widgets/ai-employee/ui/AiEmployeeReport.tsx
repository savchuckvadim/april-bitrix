'use client';

import { AiKpiOnlyNote } from '@/modules/widgets/ai-analytics-report';
import { useAiEmployee } from '../hooks/use-ai-employee';
import { useAiEmployeeTab } from '../hooks/use-ai-employee-tab';
import { AiEmployeeProvider } from '../lib/ai-employee.context';
import { AiEmployeeHeader } from './AiEmployeeHeader';
import { AiEmployeeTabsBar } from './AiEmployeeTabsBar';
import { AiEmployeeBriefTab } from './tabs/AiEmployeeBriefTab';
import { AiEmployeeTargetTab } from './tabs/AiEmployeeTargetTab';
import { AiEmployeeQualityTab } from './tabs/AiEmployeeQualityTab';
import { AiEmployeeStyleTab } from './tabs/AiEmployeeStyleTab';
import { AiEmployeeCallsTab } from './tabs/AiEmployeeCallsTab';
import { AiEmployeeFeedbackTab } from './tabs/AiEmployeeFeedbackTab';

interface AiEmployeeReportProps {
    managerId: string;
}

/**
 * AI-раздел страницы сотрудника: шапка (период, ссылки), подвкладки в
 * стиле дайджеста — «Коротко», «К цели», «Качество», «Стиль», «Звонки»,
 * «Обратная связь»; подвкладка — в URL (`?aiUserTab=`), на неё ведут
 * ссылки с вкладки AI. Данные собирает use-ai-employee (общие секции
 * стора с вкладкой AI + запросы по сотруднику), подвкладки читают их из
 * контекста. В kpi-only разборов нет — пояснение вместо подвкладок.
 */
export const AiEmployeeReport = ({ managerId }: AiEmployeeReportProps) => {
    const value = useAiEmployee(managerId);
    const { tab, setTab } = useAiEmployeeTab();

    return (
        <AiEmployeeProvider value={value}>
            <div className="space-y-4">
                <AiEmployeeHeader />
                {value.kpiOnly ? (
                    <AiKpiOnlyNote />
                ) : (
                    <>
                        <AiEmployeeTabsBar tab={tab} onChange={setTab} />
                        {tab === 'brief' && <AiEmployeeBriefTab />}
                        {tab === 'target' && <AiEmployeeTargetTab />}
                        {tab === 'quality' && <AiEmployeeQualityTab />}
                        {tab === 'style' && <AiEmployeeStyleTab />}
                        {tab === 'calls' && <AiEmployeeCallsTab />}
                        {tab === 'feedback' && <AiEmployeeFeedbackTab />}
                    </>
                )}
            </div>
        </AiEmployeeProvider>
    );
};
