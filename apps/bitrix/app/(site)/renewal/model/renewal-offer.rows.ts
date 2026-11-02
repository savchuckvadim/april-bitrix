/**
 * Предложение → строки таблицы стоимости. Чистая функция без React: так
 * состав и подписи проверяются тестами, а вёрстка остаётся вёрсткой.
 *
 * Одна функция на страницу и на PDF, поэтому экран и файл не могут
 * разойтись в цифрах — расходиться может только оформление.
 */
import {
    calcAiPrice,
    calcDiscountView,
    calcExtrasOnce,
    calcHeadcountRange,
    calcMonthlyTotal,
    calcServicesMonthly,
    formatEmployees,
    formatHours,
    formatRub,
    type RenewalOffer,
} from './renewal-offer.model';

/** Строка таблицы стоимости. */
export interface RenewalPriceRow {
    /** Название услуги. */
    readonly title: string;
    /** Из чего состоит цена или что входит — мелким под названием. */
    readonly note: string;
    /** Цена, уже отформатированная, или «входит». */
    readonly price: string;
    /** Услуга входит в пакет и отдельно не оплачивается. */
    readonly included: boolean;
}

/** Вся таблица: услуги, скидка, итоги. */
export interface RenewalPriceTableData {
    readonly monthly: readonly RenewalPriceRow[];
    readonly once: readonly RenewalPriceRow[];
    readonly monthlyTotal: string;
    readonly onceTotal: string | null;
    /**
     * Стоимость услуг до скидки или надбавки. Без них строка не нужна:
     * она совпала бы с итогом.
     */
    readonly servicesTotal: string | null;
    /** Скидка показывается и процентом, и суммой. */
    readonly discount: {
        /** Подпись, например «Скидка за год вперёд». */
        readonly label: string;
        /** Сумма со знаком минус. */
        readonly value: string;
        /** Доля от стоимости услуг, процентов. */
        readonly percent: number;
    } | null;
    /** Надбавка: у неё другой смысл, чем у скидки. */
    readonly surcharge: {
        readonly label: string;
        readonly value: string;
    } | null;
}

/** Собирает строки месячной части предложения. */
function buildMonthlyRows(offer: RenewalOffer): RenewalPriceRow[] {
    const rows: RenewalPriceRow[] = [];

    if (offer.salesIncluded) {
        rows.push({
            title: 'Приложения по продажам',
            note: 'Звонки, Конструктор коммерческих предложений, Отчёт KPI',
            price: formatRub(offer.salesPrice),
            included: false,
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
            included: false,
        });
    }

    if (offer.managerIncluded) {
        rows.push({
            title: 'Персональный менеджер',
            note: 'Вопросы сотрудников, заведение и обучение новых, консультации руководителей',
            price: formatRub(offer.managerPrice),
            included: false,
        });
    }

    // Без часов в пакете строка не нужна: цена часа есть в условиях.
    if (offer.devIncluded && offer.devHours > 0) {
        rows.push({
            title: `Разработка — ${formatHours(offer.devHours)} в месяц`,
            note: `Сверх этого объёма — ${formatRub(offer.devHourPrice)} за час`,
            price: 'входит',
            included: true,
        });
    }

    for (const line of offer.extras) {
        const title = line.title.trim();
        // Строку без названия не показываем: это недозаполненная форма,
        // а не услуга.
        if (!title || line.period !== 'month') {
            continue;
        }
        rows.push({
            title,
            note: '',
            price: formatRub(line.price),
            included: false,
        });
    }

    return rows;
}

/** Собирает разовые строки предложения. */
function buildOnceRows(offer: RenewalOffer): RenewalPriceRow[] {
    const rows: RenewalPriceRow[] = [];
    for (const line of offer.extras) {
        const title = line.title.trim();
        if (!title || line.period !== 'once') {
            continue;
        }
        rows.push({
            title,
            note: '',
            price: formatRub(line.price),
            included: false,
        });
    }
    return rows;
}

/** Предложение → таблица стоимости для страницы и PDF. */
export function buildRenewalPriceTable(
    offer: RenewalOffer,
): RenewalPriceTableData {
    const onceTotal = calcExtrasOnce(offer);
    const discount = calcDiscountView(offer);
    // Надбавку показываем только когда скидки нет: иначе это были бы две
    // взаимоисключающие строки в одном документе.
    const surcharge = !discount && offer.adjustment > 0 ? offer.adjustment : 0;

    return {
        monthly: buildMonthlyRows(offer),
        once: buildOnceRows(offer),
        monthlyTotal: formatRub(calcMonthlyTotal(offer)),
        onceTotal: onceTotal !== 0 ? formatRub(onceTotal) : null,
        servicesTotal:
            discount || surcharge
                ? formatRub(calcServicesMonthly(offer))
                : null,
        discount: discount
            ? {
                  label: offer.adjustmentLabel,
                  value: formatRub(-discount.amount),
                  percent: discount.percent,
              }
            : null,
        surcharge: surcharge
            ? { label: offer.adjustmentLabel, value: formatRub(surcharge) }
            : null,
    };
}
