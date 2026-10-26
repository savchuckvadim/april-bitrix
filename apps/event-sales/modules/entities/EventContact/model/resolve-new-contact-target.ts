import { Bitrix } from '@workspace/bitrix';
import type { RootState } from '@/modules/app/model/store';
import { selectWorkingUserId } from '@/modules/app/lib/utills/working-user';
import { baseSalesCategoryId } from '@/modules/entities/RelatedCrm/lib/deal-category';
import {
    buildNewContactTarget,
    pickBaseDealForContact,
    type ContactDealRow,
    type NewContactTarget,
} from '../lib/new-contact-target';

const BASE_DEAL_SELECT = ['ID', 'ASSIGNED_BY_ID', 'DATE_MODIFY'];

/**
 * Открытые сделки «ОП Основная» компании. Ошибка — пустой список: контакт
 * всё равно создаётся в компании, без сделки (как раньше).
 */
const fetchOpenBaseDeals = async (
    companyId: number,
    categoryId: number,
): Promise<ContactDealRow[]> => {
    try {
        const response = await Bitrix.getService().deal.getList(
            {
                COMPANY_ID: companyId,
                CATEGORY_ID: categoryId,
                CLOSED: 'N',
            } as never,
            BASE_DEAL_SELECT,
            { DATE_MODIFY: 'DESC' } as never,
        );
        return (response?.result ?? []) as unknown as ContactDealRow[];
    } catch (error) {
        console.error('fetchOpenBaseDeals error', companyId, error);
        return [];
    }
};

/**
 * Куда привязать новый контакт и на кого записать — по контексту фрейма
 * (правила — lib/new-contact-target). Из компании дочитывает её открытую
 * «ОП Основная»; из сделки и лида в сеть не ходит.
 */
export const resolveNewContactTarget = async (
    state: RootState,
): Promise<NewContactTarget> => {
    const { deal, company, lead } = state.app.bitrix;
    // Чья работа: сотрудник в режиме руководителя, иначе сам пользователь.
    const workOwnerId = selectWorkingUserId(state);

    let baseDeal: ContactDealRow | null = null;
    if (!deal && company) {
        const categoryId = baseSalesCategoryId(
            state.portal.portal?.bitrixDeal?.categories,
        );
        if (categoryId !== null) {
            baseDeal = pickBaseDealForContact(
                await fetchOpenBaseDeals(Number(company.ID), categoryId),
                workOwnerId,
            );
        }
    }

    return buildNewContactTarget({
        deal: deal as unknown as ContactDealRow | null,
        companyId: company?.ID,
        baseDeal,
        leadResponsibleId: (
            lead as unknown as { ASSIGNED_BY_ID?: unknown } | null
        )?.ASSIGNED_BY_ID,
        workOwnerId,
    });
};
