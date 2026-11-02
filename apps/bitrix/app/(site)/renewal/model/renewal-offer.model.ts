/**
 * Модель предложения на следующий год для ДЕЙСТВУЮЩЕГО клиента.
 *
 * Здесь только данные и расчёт — ни React, ни разметки. Сейчас источник
 * значений — параметры ссылки, позже на это же место встанет ответ бэка по
 * токену (таблица предложений + админка), и вёрстку менять не придётся.
 *
 * Ключевое правило: у каждого клиента свои цены и свой набор услуг, поэтому
 * ВСЕ суммы живут в объекте предложения, а константы ниже — только значения
 * по умолчанию (наш прайс), которые ссылка может переопределить.
 *
 * Новым клиентам адресована другая страница — /offer (там разовое внедрение).
 */

/** Три приложения по продажам идут одной строкой и одной ценой. */
export const SALES_APPS = [
    'Звонки',
    'Конструктор коммерческих предложений',
    'Отчёт KPI',
] as const;

/** Прайс по умолчанию — подставляется, когда ссылка цену не задаёт. */
export const PRICE_DEFAULTS = {
    /** Пакет приложений по продажам, ₽/мес. */
    sales: 5000,
    /** AI-сервис: базовая цена за первых сотрудников, ₽/мес. */
    aiBase: 7500,
    /** Сколько сотрудников входит в базовую цену AI-сервиса. */
    aiBaseEmployees: 3,
    /** Доплата за каждого сотрудника сверх базовых, ₽/мес. */
    aiExtra: 1000,
    /** На сколько человек можно менять состав без пересчёта цены. */
    aiFreeDelta: 2,
    /** Персональный менеджер, ₽/мес. */
    manager: 10000,
    /** Разработка сверх пакета, ₽/час. */
    devHour: 2000,
    /** Часы разработки, входящие в пакет ежемесячно. */
    devHours: 30,
} as const;

/**
 * Разумные границы для значений из ссылки. Нужны не ради «бизнес-правил»,
 * а чтобы опечатка в ссылке не превратила предложение в бессмыслицу
 * (отрицательная цена, миллион сотрудников).
 */
export const LIMITS = {
    price: { min: 0, max: 1_000_000 },
    employees: { min: 1, max: 1000 },
    hours: { min: 0, max: 1000 },
    /** Сколько «других услуг» максимум принимаем — и из ссылки, и с бэка. */
    extras: { max: 10 },
} as const;

/** Произвольная дополнительная строка предложения — услуга вне прайса. */
export interface RenewalExtraLine {
    /** Название услуги, как её увидит клиент. */
    readonly title: string;
    /** Стоимость, ₽. */
    readonly price: number;
    /** Периодичность: влияет на то, попадёт ли строка в месячный итог. */
    readonly period: 'month' | 'once';
}

/** Полный состав предложения: что включено и почём. */
export interface RenewalOffer {
    /** Название клиента в шапке; пусто — покажем обезличенный заголовок. */
    readonly clientName: string;

    /** Пакет приложений по продажам. */
    readonly salesIncluded: boolean;
    /** Цена пакета приложений, ₽/мес. */
    readonly salesPrice: number;

    /** AI-сервис. */
    readonly aiIncluded: boolean;
    /** Сотрудников в AI-сервисе — от этого числа считается цена и коридор. */
    readonly aiEmployees: number;
    /** Базовая цена AI-сервиса, ₽/мес. */
    readonly aiBasePrice: number;
    /** Сколько сотрудников входит в базовую цену. */
    readonly aiBaseEmployees: number;
    /** Доплата за сотрудника сверх базовых, ₽/мес. */
    readonly aiExtraPrice: number;
    /** Коридор изменения состава без пересчёта цены, человек. */
    readonly aiFreeDelta: number;

    /** Персональный менеджер. */
    readonly managerIncluded: boolean;
    /** Цена персонального менеджера, ₽/мес. */
    readonly managerPrice: number;

    /** Показывать ли блок про часы разработки. */
    readonly devIncluded: boolean;
    /** Часов разработки в месяц в составе пакета. */
    readonly devHours: number;
    /** Стоимость часа сверх пакета, ₽. */
    readonly devHourPrice: number;

    /** Скидка/надбавка к месячному итогу, ₽ (отрицательная — скидка). */
    readonly adjustment: number;
    /** Подпись к корректировке, например «Скидка за год вперёд». */
    readonly adjustmentLabel: string;

    /** Дополнительные строки вне прайса. */
    readonly extras: readonly RenewalExtraLine[];
}

/** Предложение по умолчанию: пакет приложений и AI-сервис на троих. */
export const DEFAULT_RENEWAL_OFFER: RenewalOffer = {
    clientName: '',

    salesIncluded: true,
    salesPrice: PRICE_DEFAULTS.sales,

    aiIncluded: true,
    aiEmployees: PRICE_DEFAULTS.aiBaseEmployees,
    aiBasePrice: PRICE_DEFAULTS.aiBase,
    aiBaseEmployees: PRICE_DEFAULTS.aiBaseEmployees,
    aiExtraPrice: PRICE_DEFAULTS.aiExtra,
    aiFreeDelta: PRICE_DEFAULTS.aiFreeDelta,

    managerIncluded: false,
    managerPrice: PRICE_DEFAULTS.manager,

    devIncluded: true,
    devHours: PRICE_DEFAULTS.devHours,
    devHourPrice: PRICE_DEFAULTS.devHour,

    adjustment: 0,
    adjustmentLabel: 'Скидка',

    extras: [],
};

/**
 * Стоимость AI-сервиса: базовая цена покрывает первых сотрудников, каждый
 * следующий добавляет доплату. Меньше базового числа цену не снижает —
 * это минимальный платёж за сервис.
 */
export function calcAiPrice(offer: RenewalOffer): number {
    const extra = Math.max(
        0,
        Math.ceil(offer.aiEmployees) - offer.aiBaseEmployees,
    );
    return offer.aiBasePrice + extra * offer.aiExtraPrice;
}

/** Границы состава, при которых цена AI-сервиса не меняется. */
export function calcHeadcountRange(offer: RenewalOffer): {
    readonly from: number;
    readonly to: number;
} {
    const fixed = Math.max(1, Math.ceil(offer.aiEmployees));
    return {
        from: Math.max(1, fixed - offer.aiFreeDelta),
        to: fixed + offer.aiFreeDelta,
    };
}

/** Сумма дополнительных строк с помесячной оплатой. */
export function calcExtrasMonthly(offer: RenewalOffer): number {
    return offer.extras
        .filter((line) => line.period === 'month')
        .reduce((sum, line) => sum + line.price, 0);
}

/** Сумма разовых дополнительных строк — в месячный итог не входит. */
export function calcExtrasOnce(offer: RenewalOffer): number {
    return offer.extras
        .filter((line) => line.period === 'once')
        .reduce((sum, line) => sum + line.price, 0);
}

/**
 * Итого в месяц: включённые услуги, помесячные дополнительные строки и
 * корректировка. Ниже нуля не опускаем — скидка больше суммы услуг означает
 * ошибку в ссылке, а не отрицательный счёт.
 */
export function calcMonthlyTotal(offer: RenewalOffer): number {
    let total = 0;
    if (offer.salesIncluded) {
        total += offer.salesPrice;
    }
    if (offer.aiIncluded) {
        total += calcAiPrice(offer);
    }
    if (offer.managerIncluded) {
        total += offer.managerPrice;
    }
    total += calcExtrasMonthly(offer);
    total += offer.adjustment;
    return Math.max(0, total);
}

/** Неразрывный пробел: цена не должна разрываться по строкам при печати. */
const NBSP = ' ';

/** 7500 → цена с неразрывными пробелами. Минус сохраняется для скидок. */
export function formatRub(amount: number): string {
    const rounded = Math.round(amount);
    const sign = rounded < 0 ? '−' : '';
    const digits = Math.abs(rounded)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    return `${sign}${digits}${NBSP}₽`;
}

/** «3 сотрудника», «5 сотрудников» — для подписи к AI-сервису. */
export function formatEmployees(count: number): string {
    const n = Math.abs(Math.ceil(count));
    const tail = n % 100;
    const last = n % 10;
    if (tail > 10 && tail < 20) {
        return `${n} сотрудников`;
    }
    if (last === 1) {
        return `${n} сотрудник`;
    }
    if (last >= 2 && last <= 4) {
        return `${n} сотрудника`;
    }
    return `${n} сотрудников`;
}

/** «30 часов», «1 час» — для блока про разработку. */
export function formatHours(count: number): string {
    const n = Math.abs(Math.round(count));
    const tail = n % 100;
    const last = n % 10;
    if (tail > 10 && tail < 20) {
        return `${n} часов`;
    }
    if (last === 1) {
        return `${n} час`;
    }
    if (last >= 2 && last <= 4) {
        return `${n} часа`;
    }
    return `${n} часов`;
}
