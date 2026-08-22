'use client';

import { FC } from 'react';
import { usePresentationDone } from '../../lib/hooks/use-presentation-done';
import { PresentationDoneButton } from './PresentationDoneButton';

/**
 * Отметка презентации в углу карточки комментария: кнопка и под ней — строка
 * о текущем состоянии.
 *
 * Подпись видна ВСЕГДА, а не только по наведению: галочка проставляется сама
 * (событие «Презентация» + результативно), и без объяснения это выглядит как
 * чужое решение. Тултип с полным разбором остаётся на кнопке — здесь коротко,
 * одной строкой.
 */
export const PresentationDoneControl: FC = () => {
    const { hint } = usePresentationDone();

    return (
        <div className="flex max-w-56 flex-col items-end gap-0.5">
            <PresentationDoneButton />
            <span className="text-right text-[0.6875rem] leading-tight text-muted-foreground">
                {hint.short}
            </span>
        </div>
    );
};
