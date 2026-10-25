'use client';

import { Check, Send } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useDealSend } from '../hooks/use-deal-send';

export interface DealSendButtonProps {
    /** После успешной отправки — на хаб документов (с «Цен»); в хабе не нужно. */
    navigateAfter?: boolean;
    className?: string;
}

/** «Создать / Сохранить сделку» — поля и товарные строки в Bitrix + слепок. */
export const DealSendButton = ({ navigateAfter = false, className }: DealSendButtonProps) => {
    const deal = useDealSend({ navigateAfter });

    if (!deal.canSend) return null;

    return (
        <div className="flex flex-col items-end gap-1">
            <Button size="sm" className={className} onClick={() => void deal.send()} disabled={deal.isSending}>
                {deal.isDone ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {deal.isSending ? 'Отправляю…' : deal.label}
            </Button>
            {deal.error ? <span className="text-xs text-destructive">{deal.error}</span> : null}
            {deal.skipped.length ? (
                <span
                    className="text-xs text-warning"
                    title={`Полей нет на портале: ${deal.skipped.join(', ')}`}
                >
                    не записано полей: {deal.skipped.length}
                </span>
            ) : null}
        </div>
    );
};
