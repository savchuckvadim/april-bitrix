'use client';

import { UserReportSection } from '@/modules/widgets/user-report/components/UserReportSection';
import { useAiEmployeeAccess } from '../hooks/use-ai-employee-access';
import { AI_EMPLOYEE_TEXT } from '../lib/ai-employee.texts';
import { AiEmployeeReport } from './AiEmployeeReport';

interface AiEmployeeSectionProps {
    /** Bitrix-id сотрудника страницы. */
    userId: number;
}

/**
 * Секция «AI-аналитика» страницы сотрудника (user-report): открыта
 * руководителю и самому сотруднику при доступной вкладке AI; остальным
 * секции нет совсем (чужие оценки не показываем).
 */
export const AiEmployeeSection = ({ userId }: AiEmployeeSectionProps) => {
    const managerId = String(userId);
    const access = useAiEmployeeAccess(managerId);
    if (!access.allowed) return null;

    return (
        <UserReportSection id="ai" title={AI_EMPLOYEE_TEXT.section.title}>
            <AiEmployeeReport managerId={managerId} />
        </UserReportSection>
    );
};
