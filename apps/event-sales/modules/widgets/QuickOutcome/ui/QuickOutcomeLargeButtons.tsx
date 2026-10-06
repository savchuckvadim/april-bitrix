'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { QUICK_OUTCOME_TEXT } from '../lib/quick-outcome';
import { useQuickOutcomeActions } from '../lib/hooks/use-quick-outcome-actions';
import { QUICK_OUTCOME_TONE_CLASS } from './quick-outcome-tone';

/**
 * «Продажа» и «Отказ» крупными кнопками — для места, где дел нет.
 *
 * Окно итога сюда не встроено: его рисует кнопочный ряд шапки
 * (QuickOutcomeButtons), который на экране списка есть всегда, — второе
 * окно открылось бы поверх первого.
 */
export const QuickOutcomeLargeButtons: FC = () => {
    const { kinds, disabled, hint, open } = useQuickOutcomeActions(false);

    return (
        <>
            {kinds.map(kind => (
                <Button
                    key={kind}
                    variant="outline"
                    disabled={disabled}
                    title={hint}
                    className={cn(QUICK_OUTCOME_TONE_CLASS[kind])}
                    onClick={() => open(kind)}
                >
                    {QUICK_OUTCOME_TEXT[kind].title}
                </Button>
            ))}
        </>
    );
};
