import React from 'react';
import { buildTerms, RENEWAL_LEAD } from '../model/renewal-offer.content';
import type { RenewalOffer } from '../model/renewal-offer.model';
import { buildRenewalPriceTable } from '../model/renewal-offer.rows';
import { RenewalIncluded } from './RenewalIncluded';
import { RenewalPriceTable } from './RenewalPriceTable';

export interface RenewalOfferViewProps {
    readonly offer: RenewalOffer;
    /** Действие в шапке документа: например, скачивание файла. */
    readonly actions?: React.ReactNode;
}

/**
 * Предложение на следующий год для действующего клиента.
 *
 * Это документ, а не рекламная страница: клиент уже работает с нами, и ему
 * нужен ответ «что и почём». Поэтому сразу под заголовком стоит таблица с
 * итогом, а описания услуг и условия идут ниже для тех, кто читает дальше.
 */
export const RenewalOfferView: React.FC<RenewalOfferViewProps> = ({
    offer,
    actions,
}) => {
    const terms = buildTerms(offer);

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                        Коммерческое предложение на следующий год
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {offer.clientName
                            ? `Условия обслуживания для «${offer.clientName}»`
                            : 'Условия обслуживания'}
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                        {RENEWAL_LEAD}
                    </p>
                </div>
                {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>

            <RenewalPriceTable table={buildRenewalPriceTable(offer)} />

            <RenewalIncluded offer={offer} />

            <section className="mt-12">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Условия
                </h2>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {terms.map((term) => (
                        <li key={term}>{term}</li>
                    ))}
                </ul>
            </section>

            <p className="mt-10 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                Предложение носит информационный характер и не является публичной
                офертой.
            </p>
        </div>
    );
};
