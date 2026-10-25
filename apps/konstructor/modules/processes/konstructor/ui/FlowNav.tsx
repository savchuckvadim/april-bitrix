'use client';

import { StepNav } from '@workspace/april-ui/navigation';
import { useFlowNav } from '../hooks/use-flow-nav';

/** Степпер шагов сборки: липкий под шапкой приложения. */
export const FlowNav = () => {
    const flow = useFlowNav();

    return (
        <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-2 backdrop-blur lg:px-6">
            <StepNav
                steps={flow.steps}
                tone={flow.tone}
                onSelect={flow.select}
                ariaLabel="Шаги сборки предложения"
                className="mx-auto max-w-screen-2xl"
            />
        </div>
    );
};
