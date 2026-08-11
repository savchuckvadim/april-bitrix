import type { LeadRequestCard } from '../model';
import { LEAD_SITE_STATUS_CODE } from '../model';

/** Тон/подпись бейджа готовности к продаже. */
export interface ReadinessBadgeView {
    tone: 'success' | 'warning';
    label: string;
}

export const getReadinessBadge = (
    card: LeadRequestCard,
): ReadinessBadgeView =>
    card.saleReadiness.ready
        ? { tone: 'success', label: 'Готова к продаже' }
        : {
              tone: 'warning',
              label: `Не отмечено: ${card.saleReadiness.missing.length}`,
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
