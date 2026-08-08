import type { BXCompany, BXDeal, BXLead } from '@workspace/bx';
import type { Portal } from '@workspace/pbx';
import type { RelatedCrmDetails } from '@/modules/entities/RelatedCrm';
import type { TaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import { classifyLead } from '@/modules/entities/EVLid/lib/lead-classification';
import {
    EHistoryBindingType,
    EVHistoryRecord,
    HISTORY_BINDING_PREFIX,
    HistoryBinding,
    HistoryBindingType,
} from '../model/history-record.type';

/**
 * Множество привязок текущего контекста — по каждой читается своя лента
 * истории (по 50 записей, догрузка per-entity).
 *
 * Источники: сущности контекста (company/deal/lead из store), связи из
 * `/duplicates/details` (сделки, лиды — включая лиды сделки по LEAD_ID и
 * op_smart_lids, контакты) и CRM-привязки текущей задачи. Значения
 * дедуплицируются; порядок = приоритет группы при дедупе записей в UI:
 * компания → сделки → лиды → контакты.
 */
export interface BuildHistoryBindingsInput {
    company: BXCompany | null;
    deal: BXDeal | null;
    lead: BXLead | null;
    related: RelatedCrmDetails | null;
    taskLinks: TaskLinks | null;
}

const label = {
    [EHistoryBindingType.COMPANY]: (id: number) => `Компания ${id}`,
    [EHistoryBindingType.DEAL]: (id: number) => `Сделка ${id}`,
    [EHistoryBindingType.LEAD]: (id: number) => `Лид ${id}`,
    [EHistoryBindingType.CONTACT]: (id: number) => `Контакт ${id}`,
} as const;

export const buildHistoryBindings = ({
    company,
    deal,
    lead,
    related,
    taskLinks,
}: BuildHistoryBindingsInput): HistoryBinding[] => {
    const byValue = new Map<string, HistoryBinding>();

    const push = (
        type: HistoryBindingType,
        rawId: unknown,
        title?: string | null,
    ) => {
        const id = Number(rawId);
        if (!Number.isFinite(id) || id <= 0) return;
        const value = `${HISTORY_BINDING_PREFIX[type]}${id}`;
        const existing = byValue.get(value);
        const cleanTitle = title?.trim();
        if (existing) {
            // Название из details богаче автоподписи — не теряем его.
            if (cleanTitle && existing.title === label[type](id)) {
                existing.title = cleanTitle;
            }
            return;
        }
        byValue.set(value, {
            value,
            type,
            id,
            title: cleanTitle || label[type](id),
        });
    };

    // Порядок вставки = приоритет групп: компания, сделки, лиды, контакты.
    push(EHistoryBindingType.COMPANY, company?.ID, company?.TITLE);

    push(EHistoryBindingType.DEAL, deal?.ID, deal?.TITLE);
    related?.deals?.forEach(item =>
        push(EHistoryBindingType.DEAL, item.id, item.title),
    );
    taskLinks?.dealIds.forEach(id => push(EHistoryBindingType.DEAL, id));

    push(EHistoryBindingType.LEAD, lead?.ID, lead?.TITLE);
    related?.leads?.forEach(item =>
        push(EHistoryBindingType.LEAD, item.id, item.title),
    );
    // Лиды-первоисточники связанных сделок (LEAD_ID) — даже если сам лид
    // не пришёл отдельной строкой.
    related?.deals?.forEach(item =>
        push(EHistoryBindingType.LEAD, item.leadId),
    );
    taskLinks?.leadIds.forEach(id => push(EHistoryBindingType.LEAD, id));

    related?.contacts?.forEach(item =>
        push(
            EHistoryBindingType.CONTACT,
            item.id,
            [item.name, item.lastName].filter(Boolean).join(' '),
        ),
    );
    taskLinks?.contactIds.forEach(id =>
        push(EHistoryBindingType.CONTACT, id),
    );

    return [...byValue.values()];
};

/**
 * Классификация лид-групп: какие лиды точно ОП и какие из них — заявка с
 * сайта. Данные — из related-лидов (`statusId`/`sourceId`/`opSourceRaw`),
 * семантика — по слепку портала (lead-classification). Мутирует переданные
 * привязки: флаги опциональны и живут только у type=lead.
 */
export const annotateLeadBindings = (
    bindings: HistoryBinding[],
    related: RelatedCrmDetails | null,
    portal: Portal | null,
): HistoryBinding[] => {
    if (!related?.leads?.length) return bindings;
    const byId = new Map(related.leads.map(item => [Number(item.id), item]));

    for (const binding of bindings) {
        if (binding.type !== EHistoryBindingType.LEAD) continue;
        const leadDto = byId.get(binding.id);
        if (!leadDto) continue;
        const { isSalesLead, isSiteRequest } = classifyLead(
            {
                statusId: leadDto.statusId ?? null,
                sourceId: leadDto.sourceId ?? null,
                opSourceRaw: leadDto.opSourceRaw ?? null,
                questUrl: leadDto.questUrl ?? null,
                regNumber: leadDto.regNumber ?? null,
            },
            portal,
        );
        binding.isSalesLead = isSalesLead;
        binding.isSiteRequest = isSiteRequest;
    }
    return bindings;
};

/** `CO_431` / `D_5512` / `L_7` / `C_9` → тип+id; мусор → null. */
export const parseBindingValue = (
    raw: string,
): { type: HistoryBindingType; id: number } | null => {
    const value = raw.trim().toUpperCase();
    for (const type of Object.values(EHistoryBindingType)) {
        const prefix = HISTORY_BINDING_PREFIX[type];
        if (!value.startsWith(prefix)) continue;
        const id = Number(value.slice(prefix.length));
        return Number.isFinite(id) && id > 0 ? { type, id } : null;
    }
    return null;
};

/** Максимум дообнаруженных лент за загрузку — предохранитель от взрыва. */
export const DISCOVERED_BINDINGS_LIMIT = 10;

/**
 * Дообнаружение связей из самих записей истории.
 *
 * Старые flow годами писали привязки прямо в поле `crm` элементов
 * («CO_431» + «L_318051» в одной записи), при этом на лиде `COMPANY_ID` мог
 * остаться пустым — CRM о связи не знает, а история знает. Собираем из уже
 * загруженных записей незнакомые `L_`/`D_`/`C_` и открываем им свои ленты.
 * Чужие `CO_` сознательно пропускаем: другая компания в привязке — сигнал
 * дубля для панели дублей, а не лента истории текущего клиента.
 */
export const collectDiscoveredBindings = (
    records: EVHistoryRecord[],
    knownValues: Iterable<string>,
): HistoryBinding[] => {
    const known = new Set(knownValues);
    const discovered = new Map<string, HistoryBinding>();

    for (const record of records) {
        for (const value of record.bindings) {
            if (known.has(value) || discovered.has(value)) continue;
            const parsed = parseBindingValue(value);
            if (!parsed || parsed.type === EHistoryBindingType.COMPANY) {
                continue;
            }
            discovered.set(value, {
                value,
                type: parsed.type,
                id: parsed.id,
                title: label[parsed.type](parsed.id),
            });
            if (discovered.size >= DISCOVERED_BINDINGS_LIMIT) {
                return [...discovered.values()];
            }
        }
    }
    return [...discovered.values()];
};
