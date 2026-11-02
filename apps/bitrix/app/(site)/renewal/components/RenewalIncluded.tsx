import React from 'react';
import {
    AI_SERVICE_ITEMS,
    MANAGER_ITEMS,
    SALES_APP_ITEMS,
} from '../model/renewal-offer.content';
import type { RenewalOffer } from '../model/renewal-offer.model';

export interface RenewalIncludedProps {
    readonly offer: RenewalOffer;
}

const LIST_TITLE =
    'border-t border-border pt-3 font-medium text-foreground';
const LIST_TEXT = 'text-sm leading-relaxed text-muted-foreground';

const ServiceList: React.FC<{
    readonly title: string;
    readonly items: readonly string[];
    /** Услуга одна в ряду: список занимает всю ширину в две колонки. */
    readonly wide: boolean;
}> = ({ title, items, wide }) => (
    <div className={wide ? 'md:col-span-2' : undefined}>
        <h3 className={LIST_TITLE}>{title}</h3>
        <ul
            className={`mt-3 space-y-2 ${LIST_TEXT} ${
                wide ? 'md:grid md:grid-cols-2 md:gap-x-8 md:space-y-0 md:gap-y-2' : ''
            }`}
        >
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

/**
 * Что входит в услуги. Цен здесь нет намеренно: за деньги отвечает таблица
 * выше, а этот блок только объясняет состав, поэтому разойтись им негде.
 */
export const RenewalIncluded: React.FC<RenewalIncludedProps> = ({ offer }) => {
    const { salesIncluded, aiIncluded, managerIncluded } = offer;
    if (!salesIncluded && !aiIncluded && !managerIncluded) {
        return null;
    }
    // AI-сервис и менеджер делят ряд, а оставшийся один растягивается на всю
    // ширину: половина строки пустой выглядела бы как потерянный блок.
    const wide = aiIncluded !== managerIncluded;

    return (
        <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Что входит
            </h2>

            {salesIncluded ? (
                <div className="mt-6">
                    <h3 className="font-medium text-foreground">
                        Приложения по продажам
                    </h3>
                    <div className="mt-3 grid gap-6 md:grid-cols-3">
                        {SALES_APP_ITEMS.map((item) => (
                            <div key={item.title}>
                                <div className={`${LIST_TITLE} text-sm`}>
                                    {item.title}
                                </div>
                                <p className={`mt-2 ${LIST_TEXT}`}>{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {aiIncluded || managerIncluded ? (
                <div className="mt-8 grid gap-8 md:grid-cols-2">
                    {aiIncluded ? (
                        <ServiceList
                            title="AI-сервис"
                            items={AI_SERVICE_ITEMS}
                            wide={wide}
                        />
                    ) : null}
                    {managerIncluded ? (
                        <ServiceList
                            title="Персональный менеджер"
                            items={MANAGER_ITEMS}
                            wide={wide}
                        />
                    ) : null}
                </div>
            ) : null}
        </section>
    );
};
