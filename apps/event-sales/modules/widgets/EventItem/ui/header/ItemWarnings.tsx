'use client';

import { FC } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_SOFT } from '@workspace/april-ui';
import type {
    ItemWarning,
    ItemWarningActionId,
} from '../../lib/hooks/use-item-warnings';

interface ItemWarningsProps {
    warnings: ItemWarning[];
    /**
     * Обработчики действий. Не все действия обязаны быть реализованы —
     * без обработчика предупреждение показывается как обычный текст.
     */
    handlers?: Partial<Record<ItemWarningActionId, () => void>>;
}

/**
 * Предупреждения шапки: чего не хватает, чтобы работать с клиентом дальше.
 * Блокирующие идут первыми и красятся в destructive — их нельзя пропустить.
 * Где возможно, рядом стоит действие: не «у вас нет ИНН», а «заполнить».
 */
export const ItemWarnings: FC<ItemWarningsProps> = ({ warnings, handlers }) => {
    if (!warnings.length) return null;

    return (
        <ul className="flex flex-wrap gap-1.5">
            {warnings.map(warning => {
                const handler = warning.action && handlers?.[warning.action.id];

                return (
                    <li
                        key={warning.id}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs',
                            TONE_SOFT[
                                warning.blocking ? 'destructive' : 'warning'
                            ],
                        )}
                    >
                        {warning.blocking ? (
                            <AlertTriangle
                                aria-hidden
                                className="size-3.5 shrink-0"
                            />
                        ) : (
                            <Info aria-hidden className="size-3.5 shrink-0" />
                        )}
                        {warning.text}
                        {warning.action && handler && (
                            <button
                                type="button"
                                onClick={handler}
                                className="cursor-pointer font-semibold underline underline-offset-2"
                            >
                                {warning.action.label}
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};
