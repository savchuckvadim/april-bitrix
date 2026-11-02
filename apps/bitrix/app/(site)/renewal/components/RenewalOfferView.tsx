import React from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import {
    AI_SERVICE_ITEMS,
    MANAGER_ITEMS,
    SALES_APP_ITEMS,
    buildTerms,
} from '../model/renewal-offer.content';
import {
    calcAiPrice,
    calcExtrasOnce,
    calcHeadcountRange,
    calcMonthlyTotal,
    formatEmployees,
    formatHours,
    formatRub,
    type RenewalOffer,
} from '../model/renewal-offer.model';
import { RenewalServiceCard } from './RenewalServiceCard';

export interface RenewalOfferViewProps {
    readonly offer: RenewalOffer;
}

/**
 * Предложение на следующий год для действующего клиента: состав услуг,
 * цены и условия. Серверный компонент — на странице нет ничего
 * интерактивного, кроме кнопки печати, которая живёт отдельно.
 */
export const RenewalOfferView: React.FC<RenewalOfferViewProps> = ({
    offer,
}) => {
    const aiPrice = calcAiPrice(offer);
    const headcount = calcHeadcountRange(offer);
    const total = calcMonthlyTotal(offer);
    const onceTotal = calcExtrasOnce(offer);
    // Строку без названия не показываем: карточка без заголовка выглядит
    // как ошибка, хотя это всего лишь недозаполненная ссылка.
    const namedExtras = offer.extras.filter((line) => line.title.trim());
    const monthlyExtras = namedExtras.filter((line) => line.period === 'month');
    const onceExtras = namedExtras.filter((line) => line.period === 'once');
    const terms = buildTerms(offer);

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <header className="mb-10">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    Коммерческое предложение на следующий год
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {offer.clientName
                        ? `Условия обслуживания для «${offer.clientName}»`
                        : 'Условия обслуживания'}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                    Состав услуг и стоимость на следующий год. Всё, чем вы
                    пользуетесь сейчас, продолжает работать — ниже зафиксированы
                    цены и условия.
                </p>
            </header>

            <div className="space-y-6">
                {offer.salesIncluded ? (
                    <RenewalServiceCard
                        title="Приложения по продажам"
                        price={formatRub(offer.salesPrice)}
                        period="в месяц"
                        badge="3 приложения"
                        tone="primary"
                    >
                        <ul className="space-y-3">
                            {SALES_APP_ITEMS.map((item) => (
                                <li key={item.title}>
                                    <span className="font-medium text-foreground">
                                        {item.title}.
                                    </span>{' '}
                                    {item.text}
                                </li>
                            ))}
                        </ul>
                    </RenewalServiceCard>
                ) : null}

                {offer.aiIncluded ? (
                    <RenewalServiceCard
                        title="AI-сервис"
                        price={formatRub(aiPrice)}
                        period="в месяц"
                        badge={formatEmployees(offer.aiEmployees)}
                        tone="info"
                        note={`${formatRub(
                            offer.aiBasePrice,
                        )} за ${formatEmployees(
                            offer.aiBaseEmployees,
                        )}, далее ${formatRub(
                            offer.aiExtraPrice,
                        )} за каждого следующего.${
                            offer.aiFreeDelta > 0
                                ? ` Состав можно менять от ${headcount.from} до ${headcount.to} человек без изменения стоимости.`
                                : ''
                        }`}
                    >
                        <ul className="space-y-2">
                            {AI_SERVICE_ITEMS.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </RenewalServiceCard>
                ) : null}

                {offer.managerIncluded ? (
                    <RenewalServiceCard
                        title="Персональный менеджер"
                        price={formatRub(offer.managerPrice)}
                        period="в месяц"
                        tone="secondary"
                    >
                        <ul className="space-y-2">
                            {MANAGER_ITEMS.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </RenewalServiceCard>
                ) : null}

                {monthlyExtras.map((line) => (
                    <RenewalServiceCard
                        key={`month-${line.title}`}
                        title={line.title}
                        price={formatRub(line.price)}
                        period="в месяц"
                        tone="accent"
                    >
                        <p>Дополнительная услуга в составе предложения.</p>
                    </RenewalServiceCard>
                ))}

                {onceExtras.map((line) => (
                    <RenewalServiceCard
                        key={`once-${line.title}`}
                        title={line.title}
                        price={formatRub(line.price)}
                        period="разово"
                        badge="разовая услуга"
                        tone="warning"
                    >
                        <p>
                            Оплачивается один раз, в ежемесячный платёж не
                            входит.
                        </p>
                    </RenewalServiceCard>
                ))}
            </div>

            <SectionCard
                title="Итого"
                tone="success"
                accent
                surface="solid"
                className="mt-6"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm leading-relaxed text-muted-foreground">
                        <p>
                            Ежемесячный платёж по выбранным услугам. Стоимость
                            зафиксирована на 12 месяцев с момента продления.
                        </p>
                        {offer.adjustment !== 0 ? (
                            <p className="mt-2 text-foreground">
                                {offer.adjustmentLabel}:{' '}
                                {formatRub(offer.adjustment)} в месяц — уже
                                учтено в сумме.
                            </p>
                        ) : null}
                        {onceTotal !== 0 ? (
                            <p className="mt-2">
                                Разовые услуги — {formatRub(onceTotal)},
                                оплачиваются отдельно.
                            </p>
                        ) : null}
                    </div>
                    <div className="sm:text-right">
                        <div className="text-4xl font-semibold tracking-tight text-foreground">
                            {formatRub(total)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            в месяц
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                title="Условия"
                tone="neutral"
                surface="solid"
                className="mt-6"
            >
                <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {terms.map((term) => (
                        <li key={term}>{term}</li>
                    ))}
                </ul>
            </SectionCard>

            <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
                {offer.devIncluded
                    ? `В пакет входит ${formatHours(
                          offer.devHours,
                      )} разработки в месяц; работы сверх этого объёма — ${formatRub(
                          offer.devHourPrice,
                      )} за час. `
                    : ''}
                Предложение носит информационный характер и не является
                публичной офертой.
            </p>
        </div>
    );
};
