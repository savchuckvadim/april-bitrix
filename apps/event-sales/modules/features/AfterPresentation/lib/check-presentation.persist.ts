import { toCrmDate } from '@/modules/shared/lib/crm-date';
import {
    CheckPresentationFieldType,
    type CheckPresentationValue,
} from '../type/check-presentation-type';

/**
 * Как ответы опросника ложатся в поля Битрикса. Данные и преобразования
 * отдельно от запросов.
 */

/**
 * Значение ответа в том виде, в каком его принимает пользовательское поле.
 *
 * Даты уходят через общий нормализатор портала (`DD.MM.YYYY`): раньше в CRM
 * улетало ровно то, что отдал `<input type=date>` (`YYYY-MM-DD`), мимо канона,
 * которым пишет весь остальной код.
 */
export const toPortalValue = (
    value: CheckPresentationValue,
    type?: CheckPresentationFieldType,
): string | null => {
    if (typeof value === 'boolean') return value ? 'Y' : 'N';
    if (Array.isArray(value)) {
        // Множественный список пишется id-шниками элементов, а их в ответах
        // нет: такие поля пока не переносим, вместо тихой порчи — пропуск.
        return null;
    }
    const text = String(value ?? '').trim();
    if (!text) return null;
    // Неразбираемую дату не пишем сырой строкой: пусть поле останется как
    // было, чем ляжет мусор, который потом никто не прочитает.
    if (type === CheckPresentationFieldType.DATE) return toCrmDate(text);
    return text;
};

export interface PortalFieldWriteInput {
    /** Ответы опросника: код поля → значение. */
    answers: Record<string, CheckPresentationValue>;
    /** Резолвер ключа поля у конкретной сущности; нет поля — null. */
    resolveKey: (code: string) => string | null;
    /** Тип вопроса по коду — от него зависит формат значения (даты). */
    typeByCode?: Record<string, CheckPresentationFieldType>;
}

/**
 * Payload для `*.update`: только те ответы, под которые на портале ЕСТЬ поле.
 *
 * Полей может не быть вовсе (портал без установки), и писать наугад по
 * `UF_CRM_<КОД>` нельзя — это ровно та ошибка, из-за которой характеристики
 * контакта не читались.
 */
export const buildPortalFieldPayload = ({
    answers,
    resolveKey,
    typeByCode,
}: PortalFieldWriteInput): Record<string, string> => {
    const payload: Record<string, string> = {};

    for (const [code, value] of Object.entries(answers)) {
        const key = resolveKey(code);
        if (!key) continue;
        const portalValue = toPortalValue(value, typeByCode?.[code]);
        if (portalValue === null) continue;
        payload[key] = portalValue;
    }

    return payload;
};

/**
 * Есть ли вообще что записывать: хотя бы один ответ даёт значение для
 * портала.
 *
 * Нужно для честного итога записи. «Ни одна цель не приняла» — провал
 * только тогда, когда записывать БЫЛО что: пустой опросник, который никуда
 * не поехал, — не провал, а отсутствие ответов. Правило годности значения
 * ровно одно с `buildPortalFieldPayload` (пустая строка, неразбираемая дата
 * и множественный список ответом не считаются) — иначе итог расходился бы
 * с тем, что реально уходит в Битрикс.
 */
export const hasWritablePortalAnswers = (
    answers: Record<string, CheckPresentationValue>,
    typeByCode?: Record<string, CheckPresentationFieldType>,
): boolean =>
    Object.entries(answers).some(
        ([code, value]) => toPortalValue(value, typeByCode?.[code]) !== null,
    );

/**
 * Коды шести вопросов «Разговора» в опроснике (xo_*) → коды полей реестра
 * pbx (op_talk_*). Вопросы исторически заведены под кодами опросника,
 * которых нет ни в одном реестре полей: фрейм-запись резолвила их в никуда,
 * ручка /presentation-survey их не принимала — ответы жили только строкой
 * в комментарии, и снимку смарта (PRES_TALK_*) было нечего читать
 * (todo3108 №1). Переводим на границе: данные опросника не трогаем.
 */
const XO_TO_TALK_FIELD: Record<string, string> = {
    xo_impression: 'op_talk_impression',
    xo_remembered: 'op_talk_remembered',
    xo_desire_to_work: 'op_talk_desire',
    xo_decision_process: 'op_talk_decision_process',
    xo_price_opinion: 'op_talk_price_opinion',
    xo_readiness_to_approach_manager: 'op_talk_boss_readiness',
};

/**
 * Ответы опросника с кодами ПОЛЕЙ: xo_* переименованы в op_talk_*,
 * остальные ключи как были. Дальше этой функции коды опросника не живут —
 * и фрейм-запись, и серверная ручка видят только реестровые коды.
 */
export const translateSurveyCodes = <T>(
    answers: Record<string, T>,
): Record<string, T> =>
    Object.fromEntries(
        Object.entries(answers).map(([code, value]) => [
            XO_TO_TALK_FIELD[code] ?? code,
            value,
        ]),
    );

/** Порядок и подписи сводки — те же «К», что в анкете. */
const FIVE_K_SUMMARY_CODES = [
    'op_5k_client_what',
    'op_5k_client_ready',
    'op_5k_client_price',
    'op_5k_company_who',
    'op_5k_company_how',
    'op_5k_company_right',
    'op_5k_command',
    'op_5k_concurent',
    'op_5k_criteri',
] as const;

/**
 * Сводное «Пять К» из ответов анкеты: `ЗАГОЛОВОК: ответ` построчно.
 *
 * Отдельные op_5k_* живут только на лиде, а сводка — и на сделке: тот, кто
 * открыл сделку без лида, всё равно видит итог презентации одним полем.
 * Пустые ответы пропускаются; не ответили ни на один — сводки нет, пустую
 * строку не пишем (она стёрла бы прошлую).
 */
export const buildFiveKSummary = (
    answers: Record<string, CheckPresentationValue>,
    titleByCode: Record<string, string>,
): string | null => {
    const lines: string[] = [];

    for (const code of FIVE_K_SUMMARY_CODES) {
        const value = toPortalValue(answers[code] ?? '');
        if (!value) continue;
        const title = titleByCode[code] ?? code;
        lines.push(`${title} ${value}`);
    }

    return lines.length ? lines.join('\n') : null;
};
