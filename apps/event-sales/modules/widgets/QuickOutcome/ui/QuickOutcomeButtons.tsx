'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { QUICK_OUTCOME_TEXT } from '../lib/quick-outcome';
import { useQuickOutcomeActions } from '../lib/hooks/use-quick-outcome-actions';
import { QuickOutcomeAction } from './QuickOutcomeAction';

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
 * без открытия дела. Какие кнопки показать — правило getQuickOutcomeButtons:
 * в сделке без компании «Продажа» серая с подсказкой «Добавьте компанию в
 * сделку».
 *
 * Окно итога рисуется только здесь: шапка на экране списка есть всегда, и
 * крупные кнопки пустого списка (QuickOutcomeLargeButtons) открывают это же
 * окно.
 */
export const QuickOutcomeButtons: FC<QuickOutcomeButtonsProps> = ({
    isItemScreen,
}) => {
    const { buttons, disabled, hint, open } =
        useQuickOutcomeActions(isItemScreen);
    const isStarted = useAppSelector(s => s.quickOutcome.kind !== null);

    return (
        <>
            {buttons.map(button => (
                <QuickOutcomeAction
                    key={button.kind}
                    button={button}
                    label={QUICK_OUTCOME_TEXT[button.kind].button}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    disabled={disabled}
                    hint={hint}
                    onOpen={open}
                />
            ))}
            {isStarted && <QuickOutcomeDialog />}
        </>
    );
};
