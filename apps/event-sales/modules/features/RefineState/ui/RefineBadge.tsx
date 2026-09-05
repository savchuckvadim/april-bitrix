'use client';

import { FC } from 'react';
import { HintTooltip } from '@workspace/april-ui';
import { useRefineState } from '../lib/hooks/use-refine-state';

/**
 * «На доработке» — бейдж в шапке клиента.
 *
 * Стадии «Доработка» в воронке портала может не быть, а знать, что клиента
 * дорабатывают (с какого дня и почему), менеджеру нужно до звонка. Тултип
 * отвечает на оба вопроса; сам бейдж — только факт.
 *
 * Флаг снят или поле не установлено — бейджа нет: «не на доработке» и так
 * очевидно.
 */
export const RefineBadge: FC = () => {
    const state = useRefineState();

    if (!state?.isActive) return null;

    const title = state.sinceLabel
        ? `На доработке с ${state.sinceLabel}`
        : 'На доработке';
    const lines = state.reason
        ? [state.reason]
        : ['Причина не записана — заполняется в чек-листе доработки.'];

    return (
        <HintTooltip title={title} lines={lines}>
            <span className="shrink-0 cursor-default rounded-full bg-event-refine/20 px-1.5 py-px text-[0.625rem] font-medium text-[color:color-mix(in_oklab,var(--event-refine),var(--foreground)_var(--tone-soft-mix-strong))]">
                доработка
            </span>
        </HintTooltip>
    );
};
