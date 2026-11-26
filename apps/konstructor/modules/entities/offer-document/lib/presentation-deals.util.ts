import type { IBXDeal } from '@bitrix/domain';
import { findUfKey } from '@workspace/pbx';
import { getPresentationCategoryId, type Portal } from '../../portal';
import type { PresentationDeal } from '../model/types';

/**
 * pbx-код поля сделки «Корневая сделка Продажи»: у сделки презентации в нём
 * лежит основная сделка. Ключ UF_CRM_* берётся из слепка портала по коду
 * (доктрина docs/pbx-fields-system.md), своя копия id не нужна.
 */
export const PRESENTATION_BASE_FIELD_CODE = 'to_base_sales';

/** Поля сделок презентации: название, дата для подписи и стадия. */
export const PRESENTATION_DEAL_SELECT = ['ID', 'TITLE', 'DATE_CREATE', 'STAGE_ID'];

/** Запрос `crm.deal.list` по сделкам презентации основной сделки. */
export interface PresentationDealsQuery {
    filter: Partial<IBXDeal>;
    select: string[];
    order: { DATE_CREATE: 'DESC' };
}

export interface PresentationDealsQueryInput {
    portal: Portal | null;
    /** Основная сделка, под которой открыт конструктор */
    dealId: number;
    /** Компания сделки; без неё фильтр по компании не ставится */
    companyId?: number | null;
}

/**
 * Запрос сделок презентации: воронка `sales_presentation` и ссылка
 * `to_base_sales` на текущую сделку, той же компании, свежие первыми. Значение
 * crm-поля лежит с префиксом (`D_123`) или без (зависит от набора разрешённых
 * сущностей поля), поэтому ищем оба вида. Нет поля или воронки на портале —
 * null: презентаций там быть не может, вопрос просто не показывается.
 */
export const buildPresentationDealsQuery = ({
    portal,
    dealId,
    companyId,
}: PresentationDealsQueryInput): PresentationDealsQuery | null => {
    const baseKey = findUfKey(portal?.bitrixDeal?.bitrixfields, PRESENTATION_BASE_FIELD_CODE);
    const categoryId = getPresentationCategoryId(portal);
    if (!baseKey || categoryId === null || !Number.isFinite(dealId) || dealId <= 0) return null;
    return {
        filter: {
            CATEGORY_ID: String(categoryId),
            ...(companyId && companyId > 0 ? { COMPANY_ID: String(companyId) } : {}),
            [baseKey]: [String(dealId), `D_${dealId}`],
        },
        select: PRESENTATION_DEAL_SELECT,
        order: { DATE_CREATE: 'DESC' },
    };
};

const timeOf = (iso: string): number => {
    const time = Date.parse(iso);
    return Number.isFinite(time) ? time : 0;
};

/**
 * Строки `crm.deal.list` → сделки презентации: свежие первыми (при равной
 * дате — с большим номером), без повторов и строк без номера. Пустое название
 * заменяется номером сделки.
 */
export const toPresentationDeals = (rows: ReadonlyArray<Partial<IBXDeal>>): PresentationDeal[] => {
    const byId = new Map<number, PresentationDeal>();
    for (const row of rows) {
        const id = Number(row.ID);
        if (!Number.isFinite(id) || id <= 0 || byId.has(id)) continue;
        byId.set(id, {
            id,
            title: String(row.TITLE ?? '').trim() || `Сделка №${id}`,
            createdAt: String(row.DATE_CREATE ?? ''),
            stageId: String(row.STAGE_ID ?? ''),
        });
    }
    return [...byId.values()].sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt) || b.id - a.id);
};

const ISO_DATE_PART = /^(\d{4})-(\d{2})-(\d{2})/;

/** Дата Битрикса (ISO с зоной) → «дд.мм.гггг»; нет даты или другой вид — пустая строка. */
export const formatPresentationDate = (createdAt: string): string => {
    const match = ISO_DATE_PART.exec(createdAt.trim());
    return match ? `${match[3]}.${match[2]}.${match[1]}` : '';
};

/** Подпись презентации в списке выбора и в сводке: название и дата. */
export const presentationLabel = (deal: Pick<PresentationDeal, 'title' | 'createdAt'>): string => {
    const date = formatPresentationDate(deal.createdAt);
    return date ? `${deal.title} (${date})` : deal.title;
};
