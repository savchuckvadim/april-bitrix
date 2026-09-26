'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAiFeedback } from '../../hooks/use-ai-feedback';
import { AiFeedbackError } from './AiFeedbackError';
import { AiReadOnlyHint } from './AiReadOnlyHint';

interface AiFeedbackButtonsProps {
    /** Объект реакции: pulse, agenda, call:<id>, attention:… */
    object: string;
    managerId?: string | null;
    transcriptionId?: string | null;
    className?: string;
}

/**
 * «Полезно / не полезно» по объекту витрины: выбранное подсвечено, ошибка
 * записи — рядом (повтор — тот же клик); в режиме «Смотреть как…»
 * кнопки неактивны с подсказкой.
 */
export const AiFeedbackButtons = ({
    object,
    managerId,
    transcriptionId,
    className,
}: AiFeedbackButtonsProps) => {
    const { sent, disabled, readOnlyHint, error, send } = useAiFeedback(
        'rate',
        object,
        { managerId, transcriptionId },
    );

    return (
        <div className={cn('flex flex-wrap items-center gap-1', className)}>
            <AiReadOnlyHint hint={readOnlyHint}>
                <Button
                    variant={sent === 'useful' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={disabled}
                    onClick={() => void send('useful')}
                    title="Полезно"
                >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    Полезно
                </Button>
                <Button
                    variant={sent === 'not_useful' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={disabled}
                    onClick={() => void send('not_useful')}
                    title="Не полезно"
                >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    Не полезно
                </Button>
            </AiReadOnlyHint>
            <AiFeedbackError error={error} />
        </div>
    );
};
