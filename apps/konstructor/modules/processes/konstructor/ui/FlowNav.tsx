'use client';

import { StepNav } from '@workspace/april-ui/navigation';
import { cn } from '@workspace/ui/lib/utils';
import { useFlowNav } from '../hooks/use-flow-nav';

export interface FlowNavProps {
    /** Вкладка карточки CRM: ниже полоса, мельче шаги */
    compact?: boolean;
}

/**
 * Степпер шагов сборки: липкий под шапкой приложения, на её ширину и с теми же
 * полями — края не зависят от ширины экрана шага (она у шагов разная). Во
 * вкладке карточки CRM — компактный: ниже полоса, мельче шаги.
 */
export const FlowNav = ({ compact: isSmall = false }: FlowNavProps) => {
    const flow = useFlowNav();

    return (
        <div
            className={cn(
                'sticky top-0 z-10 border-b bg-background/95 backdrop-blur',
                isSmall ? 'px-3 py-1' : 'px-4 py-2 lg:px-6',
            )}
        >
            <StepNav
                steps={flow.steps}
                tone={flow.tone}
                onSelect={flow.select}
                ariaLabel="Шаги сборки предложения"
                size={isSmall ? 'compact' : 'default'}
                stretch
            />
        </div>
    );
};
