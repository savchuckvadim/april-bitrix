import type { LeadRequestCard } from '../model';
import { LEAD_SITE_STATUS_CODE } from '../model';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

/**
 * Отработана ли заявка — и что осталось.
 *
 * Считаем ровно по отметкам, которые ведёт бэк (`saleReadiness`): статус
 * заявки и проверка на дубли. Компании и отметки «не ЦА» бейдж больше не
 * требует (решение владельца 15.09): заявка живёт и без них — клиент бывает
 * физлицом, компанию заводят позже, исход бывает и третьим. Прежнее правило
 * такую заявку объявляло провалом — красным «Не отработана» и зовущим
 * эхо-кольцом, — хотя отмечать менеджеру было нечего.
 */
export interface ReadinessBadgeView {
    tone: 'success' | 'warning';
    label: string;
    /** Чего не хватает — списком под бейджем. */
    missing: string[];
    /**
     * Та же правда одной строкой — для подсказки на бейдже и на иконке.
     * Бейдж говорит «Отработана не до конца: 1», и первый же вопрос к нему —
     * «а что именно осталось?»: ответ есть в карточке, но бейджи живут в
     * пульте и в миниатюре, где карточка ещё не открыта.
     */
    hint: string;
}

export const getReadinessBadge = (
    card: LeadRequestCard,
): ReadinessBadgeView => {
    const missing = [...card.saleReadiness.missing];

    // Подсказка собирается из того же списка, что и строка под бейджем:
    // два места, где менеджер спрашивает «а что осталось?», обязаны
    // отвечать одинаково.
    const hintOf = (label: string): string =>
        missing.length > 0
            ? `${label}. ${LEAD_REQUEST_TEXT.readinessMissingPrefix}: ${missing.join(', ')}`
            : label;

    if (card.saleReadiness.ready) {
        return {
            tone: 'success',
            label: 'Отработана',
            missing,
            hint: hintOf('Отработана'),
        };
    }

    const label = `Отработана не до конца: ${missing.length}`;

    return {
        tone: 'warning',
        label,
        missing,
        hint: hintOf(label),
    };
};

/**
 * Селект «Тип не ЦА» виден, когда статус заявки уже «Не ЦА» либо тип
 * был проставлен ранее (иначе поле только шумит).
 */
export const shouldShowNotCaSelect = (card: LeadRequestCard): boolean =>
    card.siteStatus.currentCode ===
        LEAD_SITE_STATUS_CODE.op_lead_site_status3 ||
    Boolean(card.notCaType.currentCode);

/** История свежими записями вверх (на лиде хранится хронологически). */
export const getHistoryNewestFirst = (card: LeadRequestCard): string[] =>
    [...card.history].reverse();

/** Минимум, нужный от связанного лида для выбора лида панели. */
interface PanelLeadCandidate {
    id: number;
    statusSemanticId?: string | null;
}

/** Семантики закрытого лида Bitrix: S — сконвертирован, F — забракован. */
const CLOSED_LEAD_SEMANTICS: readonly string[] = ['S', 'F'];

/**
 * Лид для панели на доске клиента: первый ОТКРЫТЫЙ из связанных, иначе
 * первый вообще (закрытую заявку тоже можно смотреть), иначе undefined —
 * панель возьмёт лид из контекста встройки.
 */
export const getPanelLeadId = (
    leads: PanelLeadCandidate[] | undefined,
): number | undefined => {
    if (!leads?.length) return undefined;
    const open = leads.find(
        lead => !CLOSED_LEAD_SEMANTICS.includes(lead.statusSemanticId ?? ''),
    );
    return (open ?? leads[0])?.id;
};
