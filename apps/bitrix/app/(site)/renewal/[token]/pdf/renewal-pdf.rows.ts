/**
 * Предложение → строки документа. Чистая функция без React: так состав
 * и подписи таблицы проверяются тестами, а JSX-шаблон остаётся вёрсткой.
 *
 * Та же модель, что у страницы, поэтому PDF и HTML не могут разойтись
 * в цифрах — расходиться может только оформление.
 */
import {
    calcAiPrice,
    calcExtrasOnce,
    calcHeadcountRange,
    calcMonthlyTotal,
    formatEmployees,
    formatHours,
    formatRub,
    type RenewalOffer,
} from '../../model/renewal-offer.model';

/** Строка таблицы стоимости. */
export interface RenewalPdfRow {
    /** Название услуги. */
    readonly title: string;
    /** Из чего состоит цена или что входит — мелким под названием. */
    readonly note: string;
    /** Цена, уже отформатированная. */
    readonly price: string;
    /** Периодичность словами. */
    readonly period: 'в месяц' | 'разово';
}

/** Готовый документ: таблица, итоги и условия. */
export interface RenewalPdfDocumentRows {
    readonly monthly: readonly RenewalPdfRow[];
    readonly once: readonly RenewalPdfRow[];
    readonly monthlyTotal: string;
    readonly onceTotal: string | null;
    /** Подпись корректировки, когда она есть. */
    readonly adjustment: { label: string; value: string } | null;
}

/** Собирает строки месячной части предложения. */
function buildMonthlyRows(offer: RenewalOffer): RenewalPdfRow[] {
    const rows: RenewalPdfRow[] = [];

    if (offer.salesIncluded) {
        rows.push({
            title: 'Приложения по продажам',
            note: 'Звонки, Конструктор коммерческих предложений, Отчёт KPI',
            price: formatRub(offer.salesPrice),
            period: 'в месяц',
        });
    }

    if (offer.aiIncluded) {
        const headcount = calcHeadcountRange(offer);
        const base = `${formatRub(offer.aiBasePrice)} за ${formatEmployees(
            offer.aiBaseEmployees,
        )}, далее ${formatRub(offer.aiExtraPrice)} за каждого следующего`;
        const corridor =
            offer.aiFreeDelta > 0
                ? `; состав можно менять от ${headcount.from} до ${headcount.to} человек без изменения стоимости`
                : '';
        rows.push({
            title: `AI-сервис — ${formatEmployees(offer.aiEmployees)}`,
            note: `${base}${corridor}`,
            price: formatRub(calcAiPrice(offer)),
            period: 'в месяц',
        });
    }

    if (offer.managerIncluded) {
        rows.push({
            title: 'Персональный менеджер',
            note: 'Вопросы сотрудников, заведение и обучение новых, консультации руководителей',
            price: formatRub(offer.managerPrice),
            period: 'в месяц',
        });
    }

    for (const line of offer.extras) {
        const title = line.title.trim();
        // Строку без названия не показываем: в ссылке она означает
        // недозаполненную форму, а не услугу.
        if (!title || line.period !== 'month') {
            continue;
        }
        rows.push({
            title,
            note: '',
            price: formatRub(line.price),
            period: 'в месяц',
        });
    }

    return rows;
}

/** Собирает разовые строки предложения. */
function buildOnceRows(offer: RenewalOffer): RenewalPdfRow[] {
    const rows: RenewalPdfRow[] = [];
    for (const line of offer.extras) {
        const title = line.title.trim();
        if (!title || line.period !== 'once') {
            continue;
        }
        rows.push({
            title,
            note: 'Оплачивается один раз, в ежемесячный платёж не входит',
            price: formatRub(line.price),
            period: 'разово',
        });
    }
    return rows;
}

/** Предложение → всё, что печатает документ. */
export function buildRenewalPdfRows(
    offer: RenewalOffer,
): RenewalPdfDocumentRows {
    const once = buildOnceRows(offer);
    const onceTotal = calcExtrasOnce(offer);

    return {
        monthly: buildMonthlyRows(offer),
        once,
        monthlyTotal: formatRub(calcMonthlyTotal(offer)),
        onceTotal: onceTotal !== 0 ? formatRub(onceTotal) : null,
        adjustment:
            offer.adjustment !== 0
                ? {
                      label: offer.adjustmentLabel,
                      value: formatRub(offer.adjustment),
                  }
                : null,
    };
}

/** Сноска про часы разработки — зависит от состава предложения. */
export function buildRenewalPdfDevNote(offer: RenewalOffer): string | null {
    if (!offer.devIncluded) {
        return null;
    }
    if (offer.devHours > 0) {
        return `В пакет входит ${formatHours(
            offer.devHours,
        )} разработки в месяц; работы сверх этого объёма — ${formatRub(
            offer.devHourPrice,
        )} за час.`;
    }
    return `Разработка — ${formatRub(offer.devHourPrice)} за час.`;
}
