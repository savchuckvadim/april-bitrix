import type { SiteLeadPayload } from '../../_site-inbox/site-inbox-backend';
import { hasReachableContact } from '../../_site-inbox/site-lead-contacts';

/**
 * Заявка с формы главной (/home, компонент LeadForm) → заявка бэка вида
 * «обратный звонок». Форма шлёт свои поля как есть, плюс UTM-метки и
 * служебные отметки; разбираем здесь, браузеру не верим.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

const LIMITS = { name: 100, phone: 40, email: 200, company: 200, managers: 20, comment: 1500, utm: 100 } as const;

/** Потолок комментария у бэка: слова посетителя, менеджеры и метки вместе. */
const COMMENT_MAX_LENGTH = 2000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const readText = (source: Record<string, unknown>, key: string, limit: number): string => {
    const value = source[key];
    return typeof value === 'string' ? value.trim().slice(0, limit) : '';
};

/** Комментарий для чата: слова посетителя, число менеджеров, UTM-метки. */
const buildComment = (source: Record<string, unknown>): string => {
    const managers = readText(source, 'managersCount', LIMITS.managers);
    const utm = UTM_KEYS.map(key => readText(source, key, LIMITS.utm)).filter(Boolean);
    return [
        readText(source, 'comment', LIMITS.comment),
        managers ? `Менеджеров: ${managers}` : '',
        utm.length > 0 ? `Метки: ${utm.join(', ')}` : '',
    ]
        .filter(Boolean)
        .join('\n')
        .slice(0, COMMENT_MAX_LENGTH);
};

/**
 * null — не заявка: нет имени, нет согласия на обработку данных или нет ни
 * телефона из десяти цифр, ни нормальной почты. Сомнительный второй контакт
 * уходит как есть — бэк пометит его в чате, а заявку не потеряет.
 */
export function parseHomeLead(body: unknown): SiteLeadPayload | null {
    if (!isRecord(body)) return null;
    const name = readText(body, 'name', LIMITS.name);
    const phone = readText(body, 'phone', LIMITS.phone);
    const email = readText(body, 'email', LIMITS.email);
    if (!name || body.privacy !== true || !hasReachableContact({ phone, email })) {
        return null;
    }

    return {
        kind: 'callback',
        name,
        phone,
        email,
        company: readText(body, 'company', LIMITS.company),
        comment: buildComment(body),
        page: '/home',
    };
}
