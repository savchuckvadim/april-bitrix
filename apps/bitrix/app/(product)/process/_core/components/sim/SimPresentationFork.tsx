'use client';

import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';

interface SimPresentationForkProps {
    isResult: boolean;
    held: boolean;
    onHeldChange: (value: boolean) => void;
}

/**
 * Развилка отчёта по презентации: состоялась встреча или был только разговор.
 *
 * Результативный отчёт по презентации по умолчанию и значит «встреча прошла» —
 * поэтому зелёный бэйдж включён сразу. Но бывает иначе: поговорили
 * результативно, а встречи не было. Тогда бэйдж отжимают, и вместо него
 * загорается синий: звонок засчитан, презентация — нет.
 *
 * Нерезультативный отчёт выбора не оставляет: встречи не было, и обсуждать
 * тут нечего.
 */
export const SimPresentationFork: FC<SimPresentationForkProps> = ({
    isResult,
    held,
    onHeldChange,
}) => {
    if (!isResult) {
        return (
            <div className="border-warning/40 bg-warning/5 rounded-lg border p-3">
                <p className="text-warning text-xs font-bold tracking-wide uppercase">
                    Презентация не проведена
                </p>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                    Отчёт нерезультативный — значит встречи не было. Если
                    назначите следующий шаг, сделка-презентация уйдёт в
                    «Перенос» и будет ждать новой даты. Если следующего шага нет
                    — закроется на «Не состоялась».
                </p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                Что засчитываем
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                    type="button"
                    onClick={() => onHeldChange(true)}
                    aria-pressed={held}
                    className={cn(
                        'focus-visible:outline-primary cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2',
                        held
                            ? 'border-success bg-success/10 text-success font-semibold'
                            : 'text-muted-foreground hover:border-success',
                    )}
                >
                    Презентация проведена
                </button>

                <button
                    type="button"
                    onClick={() => onHeldChange(false)}
                    aria-pressed={!held}
                    className={cn(
                        'focus-visible:outline-primary cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2',
                        !held
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:border-primary',
                    )}
                >
                    Проведён звонок
                </button>
            </div>

            <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed">
                {held
                    ? 'Встреча прошла: в отчёты уйдёт презентация, сделка-спутник закроется как проведённая.'
                    : 'Разговор был результативным, но встреча не состоялась: в отчёты уйдёт звонок, а сделка-презентация уйдёт в «Перенос» — либо закроется на «Не состоялась», если следующего шага нет.'}
            </p>
        </div>
    );
};
