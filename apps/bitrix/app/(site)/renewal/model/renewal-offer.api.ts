/**
 * Предложение по токену — с бэкенда (apps/pbx, модуль renewal-offer).
 *
 * Ручка ещё не попала в orval (`pnpm run generate` в
 * @workspace/nest-pbx-api запускает владелец), поэтому форма описана здесь
 * руками теми же именами — это документированный путь репозитория для
 * готового бэка без генерации. После генерации правка сведётся к импорту
 * типов из пакета вместо локального интерфейса.
 *
 * Зовём на сервере (страница — серверный компонент), поэтому токен и адрес
 * бэкенда не уходят в браузер: клиент видит только свой адрес страницы.
 */
import {
    DEFAULT_RENEWAL_OFFER,
    LIMITS,
    type RenewalExtraLine,
    type RenewalOffer,
} from './renewal-offer.model';

/** Ответ публичной ручки: состав предложения плюс срок действия. */
export interface PublicRenewalOfferResponse extends RenewalOffer {
    readonly expiresAt: string | null;
}

/** Почему предложение не открылось. */
export type RenewalFetchFailure = 'gone' | 'error';

export type RenewalFetchResult =
    | { readonly ok: true; readonly offer: RenewalOffer }
    | { readonly ok: false; readonly reason: RenewalFetchFailure };

/** Конверт ответов бэкенда: { resultCode, data } (ResponseInterceptor). */
interface BackEnvelope<T> {
    readonly resultCode?: number;
    readonly data?: T;
    readonly message?: string;
}

const PBX_FALLBACK_URL = 'https://api.pbx.april-app.ru';

/** Адрес бэкенда pbx: из окружения, иначе прод. */
function pbxBaseUrl(): string {
    // Только серверная переменная: адрес бэкенда в браузер не отдаём.
    const url = process.env.PBX_API_URL ?? '';
    return (url || PBX_FALLBACK_URL).replace(/\/+$/, '');
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const num = (value: unknown, fallback: number): number =>
    typeof value === 'number' && Number.isFinite(value)
        ? Math.round(value)
        : fallback;

const bool = (value: unknown, fallback: boolean): boolean =>
    typeof value === 'boolean' ? value : fallback;

const text = (value: unknown, fallback: string): string =>
    typeof value === 'string' ? value : fallback;

/** Строки услуг из ответа; форме ответа не доверяем. */
function readExtras(value: unknown): RenewalExtraLine[] {
    if (!Array.isArray(value)) return [];
    const lines: RenewalExtraLine[] = [];
    for (const raw of value.slice(0, LIMITS.extras.max)) {
        if (!isRecord(raw)) continue;
        const title = text(raw.title, '').trim();
        if (!title) continue;
        lines.push({
            title,
            price: num(raw.price, 0),
            period: raw.period === 'once' ? 'once' : 'month',
        });
    }
    return lines;
}

/**
 * Ответ бэкенда → предложение. Недостающее поле подменяем прайсом, а не
 * нулём: иначе ошибка контракта превратилась бы в услугу за 0 ₽ у клиента.
 */
export function toRenewalOffer(payload: unknown): RenewalOffer {
    const d = DEFAULT_RENEWAL_OFFER;
    if (!isRecord(payload)) return d;

    return {
        clientName: text(payload.clientName, d.clientName),

        salesIncluded: bool(payload.salesIncluded, d.salesIncluded),
        salesPrice: num(payload.salesPrice, d.salesPrice),

        aiIncluded: bool(payload.aiIncluded, d.aiIncluded),
        aiEmployees: num(payload.aiEmployees, d.aiEmployees),
        aiBasePrice: num(payload.aiBasePrice, d.aiBasePrice),
        aiBaseEmployees: num(payload.aiBaseEmployees, d.aiBaseEmployees),
        aiExtraPrice: num(payload.aiExtraPrice, d.aiExtraPrice),
        aiFreeDelta: num(payload.aiFreeDelta, d.aiFreeDelta),

        managerIncluded: bool(payload.managerIncluded, d.managerIncluded),
        managerPrice: num(payload.managerPrice, d.managerPrice),

        devIncluded: bool(payload.devIncluded, d.devIncluded),
        devHours: num(payload.devHours, d.devHours),
        devHourPrice: num(payload.devHourPrice, d.devHourPrice),

        discountPercent: num(payload.discountPercent, d.discountPercent),
        adjustment: num(payload.adjustment, 0),
        adjustmentLabel: text(payload.adjustmentLabel, d.adjustmentLabel),

        extras: readExtras(payload.extras),
    };
}

/**
 * Забирает предложение по токену. Отозванная, истёкшая и неизвестная
 * ссылка приходят как 410 — показываем одно и то же, чтобы перебором
 * нельзя было узнать, какие токены существуют.
 *
 * Всё остальное, включая 404, — сбой: ссылка, скорее всего, живая, а ручки
 * нет на сервере.
 */
export async function fetchRenewalOffer(
    token: string,
): Promise<RenewalFetchResult> {
    const url = `${pbxBaseUrl()}/api/renewal-offer/public/${encodeURIComponent(
        token,
    )}`;

    let response: Response;
    try {
        response = await fetch(url, {
            headers: { Accept: 'application/json' },
            // Цены персональные: ответ кэшировать нельзя, иначе чужое КП.
            cache: 'no-store',
        });
    } catch {
        return { ok: false, reason: 'error' };
    }

    // Только 410: так ручка отвечает на отозванную, истёкшую и неизвестную
    // ссылку. 404 здесь означает другое — что ручки нет на сервере (бэк не
    // выложен или адрес сменился), и живую ссылку уводить на главную нельзя.
    if (response.status === 410) {
        return { ok: false, reason: 'gone' };
    }
    if (!response.ok) {
        return { ok: false, reason: 'error' };
    }

    let body: BackEnvelope<unknown> | unknown;
    try {
        body = (await response.json()) as BackEnvelope<unknown>;
    } catch {
        return { ok: false, reason: 'error' };
    }

    // Конверт ResponseInterceptor; на случай его отсутствия берём тело как есть.
    const payload =
        isRecord(body) && 'data' in body
            ? (body as BackEnvelope<unknown>).data
            : body;
    if (!isRecord(payload)) {
        return { ok: false, reason: 'error' };
    }

    return { ok: true, offer: toRenewalOffer(payload) };
}
