import React from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import type { Tone } from '@workspace/april-ui/tones';

export interface RenewalServiceCardProps {
    /** Название услуги. */
    readonly title: string;
    /** Цена крупно: «6 500 ₽». */
    readonly price: string;
    /** Период под ценой: «в месяц». */
    readonly period: string;
    /** Примечание под ценой — например, коридор ±2 сотрудника. */
    readonly note?: string;
    /** Пометка в шапке справа: «включено», «по запросу». Не дублирует период. */
    readonly badge?: string;
    /** Цвет акцента карточки. */
    readonly tone?: Tone;
    /** Что входит в услугу. */
    readonly children: React.ReactNode;
}

/**
 * Карточка одной услуги: слева состав, справа цена.
 * Цена вынесена в отдельную колонку, чтобы при печати в PDF цифры читались
 * столбцом и предложение можно было пробежать глазами.
 */
export const RenewalServiceCard: React.FC<RenewalServiceCardProps> = ({
    title,
    price,
    period,
    note,
    badge,
    tone = 'primary',
    children,
}) => {
    return (
        <SectionCard
            title={title}
            tone={tone}
            accent
            surface="solid"
            actions={
                badge ? (
                    <ToneBadge tone={tone} variant="soft" size="sm">
                        {badge}
                    </ToneBadge>
                ) : undefined
            }
        >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {children}
                </div>
                <div className="sm:w-56 sm:shrink-0 sm:text-right">
                    <div className="text-3xl font-semibold tracking-tight text-foreground">
                        {price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {period}
                    </div>
                    {note ? (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {note}
                        </p>
                    ) : null}
                </div>
            </div>
        </SectionCard>
    );
};
