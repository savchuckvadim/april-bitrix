'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
    QUICK_OUTCOME,
    QUICK_OUTCOME_TEXT,
    type QuickOutcomeKind,
} from '../lib/quick-outcome';
import { useQuickOutcomeActions } from '../lib/hooks/use-quick-outcome-actions';
import { QUICK_OUTCOME_TONE_CLASS } from './quick-outcome-tone';

/** Порядок крупных кнопок — как просил владелец: сначала «Отказ», потом «Продажа». */
const LARGE_ORDER: readonly QuickOutcomeKind[] = [
    QUICK_OUTCOME.fail,
    QUICK_OUTCOME.sale,
];

interface QuickOutcomeLargeButtonsProps {
    /** Вид кнопок задаёт место, где они стоят (пустой список дел). */
    className?: string;
}

/**
 * «Отказ» и «Продажа» крупными кнопками — для места, где дел нет.
 *
 * Окно итога сюда не встроено: его рисует кнопочный ряд шапки
 * (QuickOutcomeButtons), который на экране списка есть всегда, — второе
 * окно открылось бы поверх первого.
 */
export const QuickOutcomeLargeButtons: FC<QuickOutcomeLargeButtonsProps> = ({
    className,
}) => {
    const { kinds, disabled, hint, open } = useQuickOutcomeActions(false);

    return (
        <>
            {LARGE_ORDER.filter(kind => kinds.includes(kind)).map(kind => (
                <Button
                    key={kind}
                    variant="outline"
                    disabled={disabled}
                    title={hint}
                    className={cn(className, QUICK_OUTCOME_TONE_CLASS[kind])}
                    onClick={() => open(kind)}
                >
                    {QUICK_OUTCOME_TEXT[kind].title}
                </Button>
            ))}
        </>
    );
};
