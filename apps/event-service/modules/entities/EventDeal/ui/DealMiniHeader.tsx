'use client';

import { FC, useEffect, useState } from 'react';
import { ADate } from '@workspace/april-ui';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { EV_DEAL_PROP } from '../type/event-deal-type';
import { useEventDeal } from '../hook/useEventDeal';
import {
    countContractMonths,
    isGiftMonths,
    formatRuDate,
    GIFT_MONTHS_TOOLTIP,
} from '../lib/contract-months.util';

/**
 * Мини-хедер «Договор»: узкая полоса над страницами (список/отчёт/финиш).
 * Просмотр: «Договор: dd.MM.yyyy — dd.MM.yyyy · N мес.», клик — компактное
 * редактирование в одну строку. Пустые даты пульсируют красным; «подарочные»
 * месяцы (7/13/25/26) — жёлтым с тултипом. Скрыт, если сделка не найдена.
 */
export const DealMiniHeader: FC = () => {
    const department = useAppSelector(state => state.app.department);
    const {
        isActive,
        contractStart,
        contractEnd,
        errors,
        handleChange,
        handleOnFocus,
    } = useEventDeal();

    const [isEdit, setIsEdit] = useState(false);
    const [warnOpen, setWarnOpen] = useState(false);

    const startError = errors[EV_DEAL_PROP.CONTRACT_START];
    const endError = errors[EV_DEAL_PROP.CONTRACT_END];
    const hasError = Boolean(startError || endError);

    // заблокированная отправка из-за дат: send() пересоздаёт объект errors на
    // каждую попытку → эффект срабатывает на каждое нажатие «отправить»
    useEffect(() => {
        if (!hasError) return;
        setWarnOpen(true);
        const timer = setTimeout(() => setWarnOpen(false), 4000);
        return () => clearTimeout(timer);
    }, [errors]);

    if (department !== APP_DEP.SERVICE || !isActive) return null;

    const hasEmpty = !contractStart || !contractEnd;
    const months = countContractMonths(contractStart, contractEnd);
    const isGift = months !== null && isGiftMonths(months);

    const warnText =
        startError && endError
            ? 'Заполните даты действия договора'
            : startError
              ? 'Заполните дату начала договора («с»)'
              : 'Заполните дату окончания договора («по»)';

    const monthsBadge =
        months !== null ? (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <span
                        className={`whitespace-nowrap rounded-lg px-1.5 font-semibold ${
                            isGift ? 'deal-pulse-gold' : ''
                        }`}
                    >
                        · {months} мес.
                    </span>
                </TooltipTrigger>
                {isGift && <TooltipContent>{GIFT_MONTHS_TOOLTIP}</TooltipContent>}
            </Tooltip>
        ) : null;

    return (
        <Tooltip open={warnOpen && hasError}>
            <TooltipTrigger asChild>
                <div
                    className={`mx-1 mb-2 flex min-h-9 flex-wrap items-center gap-2 rounded-xl bg-card px-3 py-1 text-[13px] ${
                        hasEmpty || hasError ? 'deal-pulse-red' : ''
                    }`}
                >
                    <span className="whitespace-nowrap font-semibold">
                        Договор:
                    </span>

                    {isEdit ? (
                        // редактирование — строго в строку, слева направо
                        <div className="flex flex-row flex-nowrap items-center gap-1.5">
                            <span className="text-muted-foreground">с</span>
                            <div className="w-36">
                                <ADate
                                    key={`mh-start-${contractStart}`}
                                    isOnlyDate={true}
                                    label={null}
                                    nameForHandler={EV_DEAL_PROP.CONTRACT_START}
                                    value={contractStart}
                                    errorMessage={startError}
                                    handleChange={handleChange}
                                    handleOnFocus={handleOnFocus}
                                />
                            </div>
                            <span className="text-muted-foreground">по</span>
                            <div className="w-36">
                                <ADate
                                    key={`mh-end-${contractEnd}`}
                                    isOnlyDate={true}
                                    label={null}
                                    nameForHandler={EV_DEAL_PROP.CONTRACT_END}
                                    value={contractEnd}
                                    errorMessage={endError}
                                    handleChange={handleChange}
                                    handleOnFocus={handleOnFocus}
                                />
                            </div>
                            {monthsBadge}
                            <button
                                type="button"
                                className="h-7 min-w-8 cursor-pointer rounded-md border border-success bg-transparent text-success"
                                onClick={() => setIsEdit(false)}
                            >
                                ✓
                            </button>
                        </div>
                    ) : (
                        <div
                            className="group flex cursor-pointer flex-wrap items-center gap-1.5"
                            onClick={() => setIsEdit(true)}
                        >
                            <span
                                className={
                                    hasEmpty
                                        ? 'font-semibold text-destructive'
                                        : ''
                                }
                            >
                                {contractStart ? formatRuDate(contractStart) : '—'}
                                {' — '}
                                {contractEnd ? formatRuDate(contractEnd) : '—'}
                            </span>
                            {monthsBadge}
                            <span className="text-xs opacity-40 group-hover:opacity-100">
                                ✎
                            </span>
                        </div>
                    )}
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">{warnText}</TooltipContent>
        </Tooltip>
    );
};
