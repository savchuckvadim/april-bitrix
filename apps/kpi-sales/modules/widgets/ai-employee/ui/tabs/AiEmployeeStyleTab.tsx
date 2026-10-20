'use client';

import { SectionCard } from '@workspace/april-ui';
import {
    AiHowWeCountButton,
    AiSectionState,
    AiStyleCardBody,
    AiStyleCardMeta,
    AiTheoryLink,
} from '@/modules/widgets/ai-analytics-report';
import { useAiEmployeeContext } from '../../lib/ai-employee.context';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';

const T = AI_EMPLOYEE_TEXT.style;

/**
 * Подвкладка «Стиль»: карточка стиля сотрудника (последний профиль) — то
 * же содержимое, что в диалоге стиля на вкладке AI. Стиль — не оценка.
 */
export const AiEmployeeStyleTab = () => {
    const { style } = useAiEmployeeContext();

    return (
        <SectionCard
            surface="glass"
            title={T.title}
            description={T.description}
            actions={
                <>
                    <AiTheoryLink topic="style" variant="icon" />
                    <AiHowWeCountButton endpoint="manager/style" />
                </>
            }
        >
            <AiSectionState
                status={style.status}
                error={style.error}
                loadingText={T.loading}
                onRetry={style.retry}
            />
            {style.data && (
                <div className="space-y-4">
                    <AiStyleCardBody card={style.data} />
                    <AiStyleCardMeta card={style.data} />
                </div>
            )}
        </SectionCard>
    );
};
