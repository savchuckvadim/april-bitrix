'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAiFeedback } from '../../hooks/use-ai-feedback';

interface AiFeedbackButtonsProps {
    /** Объект реакции: pulse, agenda, call:<id>. */
    object: string;
    managerId?: string | null;
    transcriptionId?: string | null;
    className?: string;
}

/** «Полезно / не полезно» по объекту витрины; выбранное подсвечено. */
export const AiFeedbackButtons = ({
    object,
    managerId,
    transcriptionId,
    className,
}: AiFeedbackButtonsProps) => {
    const { sent, pending, markUseful, markNotUseful } = useAiFeedback(object, {
        managerId,
        transcriptionId,
    });

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <Button
                variant={sent === 'useful' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                disabled={pending}
                onClick={markUseful}
                title="Полезно"
            >
                <ThumbsUp className="h-3.5 w-3.5" />
                Полезно
            </Button>
            <Button
                variant={sent === 'not_useful' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                disabled={pending}
                onClick={markNotUseful}
                title="Не полезно"
            >
                <ThumbsDown className="h-3.5 w-3.5" />
                Не полезно
            </Button>
        </div>
    );
};
