'use client';

import { FC } from 'react';
import { AlertTriangle } from 'lucide-react';
import { TONE_TEXT } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import type { InnConflict } from '../model';
import { innConflictTone } from '../lib/inn-deal-view';

interface InnConflictListProps {
    conflicts: InnConflict[];
}

/**
 * Плашки расхождений: ИНН договора против реквизита, ИНН без реквизита, тот
 * же ИНН у другой компании.
 *
 * Тексты приходят с бэка целиком — там же, где считается само расхождение.
 * Фронт их не сочиняет и не сокращает: менеджеру нужно понять причину, а не
 * увидеть код ошибки.
 */
export const InnConflictList: FC<InnConflictListProps> = ({ conflicts }) => {
    if (!conflicts.length) return null;

    return (
        <ul className="space-y-1">
            {conflicts.map((conflict, index) => (
                <li
                    key={`${conflict.kind}-${conflict.inn ?? index}`}
                    className={cn(
                        'flex items-start gap-1.5 text-xs',
                        TONE_TEXT[innConflictTone(conflict)],
                    )}
                >
                    <AlertTriangle aria-hidden className="mt-0.5 size-3.5" />
                    <span>{conflict.message}</span>
                </li>
            ))}
        </ul>
    );
};
