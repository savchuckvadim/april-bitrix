'use client';

import { StepNav } from '@workspace/april-ui/navigation';
import { useFlowNav } from '../hooks/use-flow-nav';

/**
 * Степпер шагов сборки: липкий под шапкой приложения, на её ширину и с теми же
 * полями — края не зависят от ширины экрана шага (она у шагов разная).
 */
export const FlowNav = () => {
    const flow = useFlowNav();

    return (
        <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-2 backdrop-blur lg:px-6">
            <StepNav
                steps={flow.steps}
                tone={flow.tone}
                onSelect={flow.select}
                ariaLabel="Шаги сборки предложения"
                stretch
            />
        </div>
    );
};
