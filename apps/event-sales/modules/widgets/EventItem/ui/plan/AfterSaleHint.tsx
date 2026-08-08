'use client';

import { FC } from 'react';
import { Plus } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getClientContext,
    getIsTmcMode,
} from '@/modules/app/lib/utills/app-state-util';
import { eventPlanActions } from '@/modules/entities/EventPlan';

/**
 * Подсказка режима «после продажи»: список типов сужен до «Поставки», рядом —
 * кнопка снять сужение. Появляется только когда сужение реально действует.
 */
export const AfterSaleHint: FC = () => {
    const dispatch = useAppDispatch();
    const isAfterSale = useAppSelector(s => s.eventPlan.isAfterSale);
    const isAllTypesShown = useAppSelector(s => s.eventPlan.isAllTypesShown);
    const isTmc = useAppSelector(getIsTmcMode);
    const context = useAppSelector(getClientContext);

    if (!isAfterSale || isAllTypesShown) return null;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onClick={() =>
                        dispatch(eventPlanActions.showAllTypes({ isTmc, context }))
                    }
                    className="inline-flex w-fit cursor-pointer items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                    <Plus aria-hidden className="size-3" />
                    Больше типов звонков
                </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-72">
                <p className="font-medium">Клиенту уже продали</p>
                <p className="text-primary-foreground/80">
                    Открытых сделок нет, последняя закрыта продажей. «Поставка»
                    — тип звонка как раз для таких клиентов: новая сделка не
                    создаётся и в отчётность как новая продажа не попадает.
                </p>
                <p className="text-primary-foreground/80">
                    Другие типы запустят цикл продажи заново — в воронке
                    появится вторая сделка, и продаж по клиенту станет две.
                    Если клиент действительно покупает снова — нажмите.
                </p>
            </TooltipContent>
        </Tooltip>
    );
};
