import type { LeadRequestCard } from '../model';
import { LEAD_SITE_STATUS_CODE } from '../model';

/**
 * Отработана ли заявка — и что осталось.
 *
 * «Готова к продаже» звучало как решение о клиенте («созрел») и путало: это не
 * про клиента, а про то, доведена ли заявка до конца. А доведена она ровно в
 * двух случаях: у клиента появилась КОМПАНИЯ (пошли в работу) либо заявку
 * честно закрыли как «не ЦА»/отказ. Всё остальное — заявка ещё в руках.
 *
 * Незаполненные отметки (`saleReadiness.missing` с бэка) остаются: без них
 * продажу не зафиксировать, но это уточнение, а не сам исход.
 */
export interface ReadinessBadgeView {
    tone: 'success' | 'warning' | 'destructive';
    label: string;
    /** Чего не хватает — списком под бейджем. */
    missing: string[];
    /** Исхода нет: ни компании, ни закрытия. Зовём мягким эхом. */
    isCompanyMissing: boolean;
}

export interface ReadinessInput {
    /** У клиента есть компания: заявка дошла до работы. */
    hasCompany: boolean;
}

/** Заявка закрыта как «не ЦА» — это тоже законченная работа, а не провал. */
const isClosedAsNotCa = (card: LeadRequestCard): boolean =>
    card.siteStatus.currentCode ===
        LEAD_SITE_STATUS_CODE.op_lead_site_status3 ||
    Boolean(card.notCaType.currentCode);

export const getReadinessBadge = (
    card: LeadRequestCard,
    { hasCompany }: ReadinessInput = { hasCompany: true },
): ReadinessBadgeView => {
    const isWorkedOut = hasCompany || isClosedAsNotCa(card);
    const missing = [
        ...(isWorkedOut ? [] : ['Нет компании и не отмечено «не ЦА»']),
        ...card.saleReadiness.missing,
    ];

    if (!isWorkedOut) {
        return {
            tone: 'destructive',
            label: 'Не отработана',
            missing,
            isCompanyMissing: true,
        };
    }

    return card.saleReadiness.ready
        ? {
              tone: 'success',
              label: 'Отработана',
              missing,
              isCompanyMissing: false,
          }
        : {
              tone: 'warning',
              label: `Отработана не до конца: ${missing.length}`,
              missing,
              isCompanyMissing: false,
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
