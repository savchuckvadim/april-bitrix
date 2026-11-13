'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useFlowStepActions } from '../hooks/use-flow-step-actions';

/**
 * «Назад» на предыдущий шаг. В заголовке экрана стоит на одном месте; над
 * липкой карточкой итога она ездила вместе с прокруткой.
 */
export const FlowBackButton = () => {
    const step = useFlowStepActions();
    if (!step.canGoBack) return null;

    return (
        <Button variant="ghost" onClick={step.goBack}>
            <ArrowLeft aria-hidden />
            Назад
        </Button>
    );
};
