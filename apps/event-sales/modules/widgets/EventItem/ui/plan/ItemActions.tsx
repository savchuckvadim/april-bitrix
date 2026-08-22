'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { send, useEventNavigation } from '@/modules/processes/event';
import { useLeadRequestSendBlock } from '@/modules/features/LeadRequestCard/lib/hooks/use-lead-request-send-block';

interface ItemActionsProps {
    /**
     * `column` — под карточкой плана (широкий экран, колонка sticky).
     * `bar` — нижняя панель, когда колонки схлопнулись и план уехал вниз.
     */
    variant: 'column' | 'bar';
}

/**
 * Действия отчёта: «Отмена» и «Отправить».
 *
 * Стоят под карточкой плана, а не в шапке: планирование — последний шаг перед
 * отправкой, и кнопка должна быть там, где заканчивается работа. Требование
 * «кнопка не должна уезжать из вида при длинном комментарии» сохраняется —
 * правая колонка sticky. Когда колонки схлопываются (ниже lg), тот же
 * компонент рисуется нижней панелью.
 */
export const ItemActions: FC<ItemActionsProps> = ({ variant }) => {
    const dispatch = useAppDispatch();
    const nav = useEventNavigation();
    const inProgress = useAppSelector(s => s.preloader.inProgress);
    // Непринятая заявка блокирует отправку: сначала «Принять в работу».
    const acceptBlock = useLeadRequestSendBlock();

    // Только уход: форму сбросит EventProcessInit, когда список уже открыт
    // (сброс до навигации показывал «Новое событие» прямо в уходящей форме).
    const cancel = () => nav.toList();

    return (
        <div
            className={cn(
                'flex items-center gap-2',
                variant === 'bar' &&
                    'sticky bottom-0 z-10 border-t border-border bg-background/90 px-3 py-2 backdrop-blur-sm',
            )}
        >
            <Button
                variant="outline"
                size="sm"
                onClick={cancel}
                disabled={inProgress}
                className="flex-1"
            >
                Отмена
            </Button>
            <Button
                size="sm"
                className="flex-[2] bg-action text-action-foreground hover:bg-action/90"
                onClick={() => dispatch(send())}
                disabled={inProgress || acceptBlock.blocked}
                title={acceptBlock.reason ?? undefined}
            >
                {inProgress ? 'Отправка…' : (acceptBlock.reason ?? 'Отправить')}
            </Button>
        </div>
    );
};
