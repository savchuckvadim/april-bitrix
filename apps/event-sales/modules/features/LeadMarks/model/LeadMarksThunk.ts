import { Bitrix } from '@workspace/bitrix';
import { ufKey } from '@workspace/pbx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    LEAD_NOT_CA_ITEM_CODE,
    leadMarkSelect,
    mapLeadMark,
    resolveLeadMarkFields,
    type LeadMark,
} from '../lib/lead-marks-view';
import { leadMarksActions } from './LeadMarksSlice';

/** Поля пометок из слепка портала; портал не приехал — null. */
const fieldsOf = (state: ReturnType<AppGetState>) => {
    const portalFields = state.portal.portal?.lead?.bitrixfields;
    return portalFields ? resolveLeadMarkFields(portalFields) : null;
};

/**
 * Пометки лидов клиента: crm.lead.list по id из связей.
 *
 * Свой запрос, потому что duplicates/details отдаёт лиды без UF-полей —
 * ни статуса заявки, ни атрибуции продажи там нет.
 */
export const fetchLeadMarks =
    (leadIds: number[]) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const ids = [...new Set(leadIds)].filter(id => id > 0);
        const fields = fieldsOf(getState());
        if (!ids.length || !fields) return;

        dispatch(leadMarksActions.fetchStarted());
        try {
            const response = await Bitrix.getService().lead.getList(
                { ID: ids } as never,
                leadMarkSelect(fields),
            );
            const rows = (response?.result ?? []) as Array<
                Record<string, unknown>
            >;
            dispatch(
                leadMarksActions.fetchSucceeded({
                    marks: rows.map(row => mapLeadMark(row, fields)),
                }),
            );
        } catch (error) {
            console.error('fetchLeadMarks error', error);
            dispatch(leadMarksActions.fetchFailed());
        }
    };

export interface LeadMarkPatch {
    /** Код item'а статуса заявки. */
    siteStatusCode?: string | null;
    /** Код item'а типа «не ЦА». */
    notCaTypeCode?: string | null;
    /** id сделки продажи (to_sale_deal); null — снять пометку. */
    saleDealId?: number | null;
}

/**
 * Запись пометок лида. Пессимистично: сначала успешный crm.lead.update,
 * потом состояние (эталон записи pbx-полей, docs/pbx-fields-system.md §11.2).
 *
 * Смена статуса заявки с «Не ЦА» на другой чистит тип «не ЦА» — иначе на
 * лиде остаётся причина отказа, которой больше нет.
 */
export const saveLeadMark =
    (leadId: number, patch: LeadMarkPatch) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const fields = fieldsOf(state);
        if (!fields) return false;

        const marksPatch: Partial<LeadMark> = {};
        const bitrixFields: Record<string, unknown> = {};

        if (patch.siteStatusCode !== undefined && fields.siteStatus) {
            const item = fields.siteStatus.items?.find(
                option => option.code === patch.siteStatusCode,
            );
            bitrixFields[ufKey(fields.siteStatus)] = item?.bitrixId ?? '';
            marksPatch.siteStatusCode = item ? item.code : null;

            if (patch.siteStatusCode !== LEAD_NOT_CA_ITEM_CODE && fields.notCaType) {
                bitrixFields[ufKey(fields.notCaType)] = '';
                marksPatch.notCaTypeCode = null;
            }
        }

        if (patch.notCaTypeCode !== undefined && fields.notCaType) {
            const item = fields.notCaType.items?.find(
                option => option.code === patch.notCaTypeCode,
            );
            bitrixFields[ufKey(fields.notCaType)] = item?.bitrixId ?? '';
            marksPatch.notCaTypeCode = item ? item.code : null;
        }

        if (patch.saleDealId !== undefined && fields.saleDeal) {
            // Бэк дублей фильтрует лидов по голому id сделки — пишем число.
            bitrixFields[ufKey(fields.saleDeal)] = patch.saleDealId ?? '';
            marksPatch.saleDealId = patch.saleDealId ?? null;
        }

        if (!Object.keys(bitrixFields).length) return false;

        dispatch(leadMarksActions.savingStarted({ leadId }));
        try {
            await Bitrix.getService().lead.update(leadId, bitrixFields as never);
            dispatch(leadMarksActions.markPatched({ leadId, patch: marksPatch }));
            return true;
        } catch (error) {
            console.error('saveLeadMark error', error);
            return false;
        } finally {
            dispatch(leadMarksActions.savingFinished({ leadId }));
        }
    };
