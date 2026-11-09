/**
 * Сервер сайта → приложение bot: заявки и брифы в Telegram-чат «April Client»
 * (`POST {BOT_API_URL}api/site-lead` и `…/site-lead/brief`).
 *
 * Браузер сюда не ходит: формы сайта шлют в свои Next-маршруты (/api/…), а
 * адрес бэка и ключ сайта живут только на сервере — снаружи их не видно.
 *
 * Не orval: у сайта нет сгенерированного клиента приложения bot, а общий
 * @workspace/nest-api смотрит на выведенный back.april-app.ru. Так же сайт
 * ходит в другие приложения монорепы: renewal → pbx, rop-review → kpi-sales.
 */

import { botApiUrl } from '@/lib/bot-api';

export { BOT_API_URL_DEFAULT } from '@/lib/bot-api';
export const SITE_LEAD_PATH = 'api/site-lead';
export const SITE_BRIEF_PATH = 'api/site-lead/brief';

/**
 * Ключ сервера сайта: бэк принимает отправки только с ним (SiteLeadKeyGuard).
 * То же значение — SITE_LEAD_API_KEY в env приложения bot. Только сервер.
 */
export const SITE_INBOX_KEY_HEADER = 'x-site-lead-key';

/** Бот ждёт Telegram до 15 с на сообщение — ждём чуть дольше. */
const LEAD_TIMEOUT_MS = 20_000;
/**
 * Бриф идёт частями с паузой в секунду; бэк укладывается в 45 с. Ждём чуть
 * дольше, но меньше 60 с — дальше nginx сам оборвёт ответ посетителю.
 */
const BRIEF_TIMEOUT_MS = 55_000;

/** Как SiteLeadDto бэка. */
export type SiteLeadKind = 'demo' | 'callback' | 'offer';

export interface SiteLeadPayload {
    kind: SiteLeadKind;
    name?: string;
    phone?: string;
    email?: string;
    company?: string;
    comment?: string;
    page: string;
}

/** Как SiteBriefDto бэка. */
export type SiteBriefKind = 'calibration' | 'call-review';

export interface SiteBriefPayload {
    kind: SiteBriefKind;
    company?: string;
    respondent?: string;
    domain?: string;
    protocol: string;
    page?: string;
}

/** «rejected» — бэк не принял поля (400): посетителю — «проверьте данные». */
export type SiteInboxStatus = 'sent' | 'throttled' | 'failed' | 'rejected';

export interface SiteBriefSendResult {
    status: SiteInboxStatus;
    /** Сколькими сообщениями бриф лёг в чат. */
    parts: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/** Адрес ручки заявок: база из окружения (сервер) или прод-дефолт, плюс путь. */
export const siteInboxUrl = (path: string): string => botApiUrl(path);

/** Пустые необязательные поля не шлём: в чате им не место. */
const compact = <T extends object>(payload: T): Partial<T> =>
    Object.fromEntries(
        Object.entries(payload).filter(
            ([, value]) => value !== undefined && value !== '',
        ),
    ) as Partial<T>;

type InboxResponse =
    | { status: 'sent'; data: unknown }
    | { status: 'throttled' | 'failed' | 'rejected' };

/**
 * Отправка в бэк. Никогда не бросает: сеть, таймаут, 5xx и чужой ответ —
 * «не доставлено», 429 — «подождите». Успех — только конверт resultCode 0.
 */
const postToSiteInbox = async (
    path: string,
    payload: object,
    timeoutMs: number,
): Promise<InboxResponse> => {
    let response: Response;
    try {
        response = await fetch(siteInboxUrl(path), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [SITE_INBOX_KEY_HEADER]: process.env.SITE_LEAD_API_KEY ?? '',
            },
            body: JSON.stringify(compact(payload)),
            signal: AbortSignal.timeout(timeoutMs),
            cache: 'no-store',
        });
    } catch (error) {
        console.error(`Site inbox ${path} send error:`, error);
        return { status: 'failed' };
    }

    if (response.status === 429) return { status: 'throttled' };
    if (response.status === 400) {
        // Расхождение правил сайта и бэка должно быть видно в логах, а не
        // прятаться под «не доставлено».
        console.error(`Site inbox ${path} rejected the payload:`, await response.text().catch(() => ''));
        return { status: 'rejected' };
    }
    if (!response.ok) {
        console.error(`Site inbox ${path} answered ${response.status}`);
        return { status: 'failed' };
    }
    try {
        const body: unknown = await response.json();
        return isRecord(body) && body.resultCode === 0
            ? { status: 'sent', data: body.data }
            : { status: 'failed' };
    } catch {
        return { status: 'failed' };
    }
};

export const sendSiteLead = async (
    payload: SiteLeadPayload,
): Promise<SiteInboxStatus> =>
    (await postToSiteInbox(SITE_LEAD_PATH, payload, LEAD_TIMEOUT_MS)).status;

export const sendSiteBrief = async (
    payload: SiteBriefPayload,
): Promise<SiteBriefSendResult> => {
    const result = await postToSiteInbox(
        SITE_BRIEF_PATH,
        payload,
        BRIEF_TIMEOUT_MS,
    );
    if (result.status !== 'sent') return { status: result.status, parts: 0 };
    const parts =
        isRecord(result.data) && typeof result.data.parts === 'number'
            ? result.data.parts
            : 1;
    return { status: 'sent', parts };
};
