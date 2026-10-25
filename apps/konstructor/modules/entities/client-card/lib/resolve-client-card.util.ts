import { getCrmUrl } from '@workspace/bitrix';
import {
    findFieldItemByBitrixId,
    findPortalField,
    readFieldValue,
    ufKey,
} from '@workspace/pbx';
import type { ProspectCode, ProspectItem } from '@workspace/april-ui/entity';
import { CLIENT_CHOICE_CODE, CLIENT_INN_CODE } from './client-card-fields';

type PortalFields = Parameters<typeof findPortalField>[0];

export interface ClientCardInput {
    domain: string | null;
    company: { ID: number | string; TITLE: string } | null;
    deal: { ID: number | string; TITLE?: string } | null;
    dealId: number | null;
    /** Поля компании из слепка портала (portal.company.bitrixfields). */
    companyFields: PortalFields;
}

export interface ClientChoice {
    current: string | null;
    items: ProspectItem[];
}

export interface ClientCard {
    company: { title: string; href: string | null } | null;
    deal: { label: string; href: string | null } | null;
    /** null — поля нет на портале (не рисуем). */
    prospect: (ClientChoice & { current: ProspectCode | null }) | null;
    status: (ClientChoice & { currentName: string | null }) | null;
    /** undefined — поля нет на портале; null — поле есть, ИНН не заполнен. */
    inn: string | null | undefined;
}

/** Значение enumeration-поля компании: код текущего значения и все значения. */
const readChoice = (
    fields: PortalFields,
    company: Record<string, unknown>,
    code: string,
): (ClientChoice & { currentName: string | null }) | null => {
    const field = findPortalField(fields, code);
    if (!field) return null;
    const item = findFieldItemByBitrixId(
        field,
        String(company[ufKey(field)] ?? ''),
    );
    return {
        current: item?.code ?? null,
        currentName: item?.name ?? null,
        items: (field.items ?? []).map(entry => ({
            code: entry.code,
            name: entry.name,
        })),
    };
};

/**
 * Карточка клиента для шапки — те же данные, что у шапки «Звонков»:
 * компания (ссылка на карточку CRM), сделка, прогноз, статус клиента, ИНН.
 * Поля резолвятся по pbx-коду через слепок портала (доктрина
 * docs/pbx-fields-system.md); поля нет на портале — блок не показывается.
 */
export const resolveClientCard = (input: ClientCardInput): ClientCard => {
    const { domain, company, deal, dealId, companyFields } = input;
    const raw = (company ?? null) as Record<string, unknown> | null;

    const prospect = raw
        ? readChoice(companyFields, raw, CLIENT_CHOICE_CODE.prospect)
        : null;
    const status = raw
        ? readChoice(companyFields, raw, CLIENT_CHOICE_CODE.status)
        : null;
    const innValue = raw
        ? readFieldValue(companyFields, raw, CLIENT_INN_CODE)
        : undefined;
    const hasInnField = Boolean(findPortalField(companyFields, CLIENT_INN_CODE));

    const id = dealId ?? (deal ? Number(deal.ID) : null);

    return {
        company: company
            ? {
                  title: company.TITLE || 'Компания без названия',
                  href: getCrmUrl(domain, 'company', company.ID),
              }
            : null,
        deal: id
            ? {
                  label: `Сделка № ${id}`,
                  href: getCrmUrl(domain, 'deal', id),
              }
            : null,
        prospect: prospect
            ? {
                  current: prospect.current as ProspectCode | null,
                  items: prospect.items,
              }
            : null,
        status,
        inn: hasInnField
            ? typeof innValue === 'string' && innValue.trim()
                ? innValue.trim()
                : null
            : undefined,
    };
};
