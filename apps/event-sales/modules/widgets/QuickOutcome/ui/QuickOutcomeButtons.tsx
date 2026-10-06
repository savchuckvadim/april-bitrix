'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { QUICK_OUTCOME_TEXT } from '../lib/quick-outcome';
import { useQuickOutcomeActions } from '../lib/hooks/use-quick-outcome-actions';
import { QUICK_OUTCOME_TONE_CLASS } from './quick-outcome-tone';

/*
 * Окно тянет за собой шаги отправки («Осталось заполнить», чек-лист
 * продажи) — на экране списка они не нужны, пока итог не начат. Поэтому
 * код окна подгружается по первому нажатию, а не вместе со списком.
 */
const QuickOutcomeDialog = dynamic(
    () =>
        import('./QuickOutcomeDialog').then(
            module => module.QuickOutcomeDialog,
        ),
    { ssr: false },
);

interface QuickOutcomeButtonsProps {
    /** Экран дела: там открыта форма, итог ставится в ней. */
    isItemScreen: boolean;
}

/**
 * «Продажа» и «Отказ» рядом с «создать»: итог по клиенту одним действием,
 * без открытия дела. Какие кнопки показать — правило getQuickOutcomeButtons.
 *
 * Окно итога рисуется только здесь: шапка на экране списка есть всегда, и
 * крупные кнопки пустого списка (QuickOutcomeLargeButtons) открывают это же
 * окно.
 */
export const QuickOutcomeButtons: FC<QuickOutcomeButtonsProps> = ({
    isItemScreen,
}) => {
    const { kinds, disabled, hint, open } = useQuickOutcomeActions(isItemScreen);
    const isStarted = useAppSelector(s => s.quickOutcome.kind !== null);

    return (
        <>
            {kinds.map(kind => (
                <Button
                    key={kind}
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    title={hint}
                    className={cn(
                        'h-6 px-2 text-xs',
                        QUICK_OUTCOME_TONE_CLASS[kind],
                    )}
                    onClick={() => open(kind)}
                >
                    {QUICK_OUTCOME_TEXT[kind].button}
                </Button>
            ))}
            {isStarted && <QuickOutcomeDialog />}
        </>
    );
};
