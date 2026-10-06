'use client';

import { FC } from 'react';
import {
    QUICK_OUTCOME,
    QUICK_OUTCOME_TEXT,
    type QuickOutcomeKind,
} from '../lib/quick-outcome';
import { useQuickOutcomeActions } from '../lib/hooks/use-quick-outcome-actions';
import { QuickOutcomeAction } from './QuickOutcomeAction';

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
    const { buttons, disabled, hint, open } = useQuickOutcomeActions(false);

    return (
        <>
            {LARGE_ORDER.map(kind => buttons.find(b => b.kind === kind))
                .filter(button => button !== undefined)
                .map(button => (
                    <QuickOutcomeAction
                        key={button.kind}
                        button={button}
                        label={QUICK_OUTCOME_TEXT[button.kind].title}
                        className={className}
                        disabled={disabled}
                        hint={hint}
                        onOpen={open}
                    />
                ))}
        </>
    );
};
