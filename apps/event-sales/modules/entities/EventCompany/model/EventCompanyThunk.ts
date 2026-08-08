import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Portal } from '@/modules/app/types/portal/portal-type';
import { Bitrix } from '@workspace/bitrix';
import {
    findFieldItemByBitrixId,
    findPortalField,
    ufKey,
} from '@workspace/pbx';
import { EV_COMPANY_PROP, eventCompanyActions } from './EventCompanySlice';
import { CompanyColorType } from '../utils/event-company-util';

/** Коды pbx-полей компании (реестр event; TODO: константы из pbx-data). */
const PROSPECTS_CODE = 'op_prospects';
const CLIENT_STATUS_CODE = 'op_client_status';

/**
 * Инициализация полей компании (прогноз/цвет, статус клиента) из портальной
 * конфигурации + текущих значений Bitrix-компании.
 * Вызывается listener'ом на portalActions.setPortal (store-listeners).
 */
export const setInitEventCompany =
    (portal: Portal) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const company = getState().app.bitrix.company;
        const pFields = portal.company?.bitrixfields;
        if (!company || !pFields) return;

        // Резолв по коду — пакетным резолвером (@workspace/pbx), UF_CRM_
        // руками больше не собираем.
        const colorPField = findPortalField(pFields, PROSPECTS_CODE);
        const clientStatusPField = findPortalField(pFields, CLIENT_STATUS_CODE);

        if (colorPField) {
            const colorBtrixId = ufKey(colorPField);
            const colorCurrentId = (company as unknown as Record<string, unknown>)[colorBtrixId];
            const colorCurrent =
                findFieldItemByBitrixId(colorPField, String(colorCurrentId ?? '')) ??
                undefined;
            dispatch(
                eventCompanyActions.setInitCompanyColor({
                    bitrixId: colorBtrixId,
                    items: colorPField.items,
                    current: colorCurrent,
                    field: colorPField,
                }),
            );
        }

        if (clientStatusPField) {
            const statusBtrixId = ufKey(clientStatusPField);
            const statusCurrentId = (company as unknown as Record<string, unknown>)[statusBtrixId];
            const statusCurrent =
                findFieldItemByBitrixId(
                    clientStatusPField,
                    String(statusCurrentId ?? ''),
                ) ?? undefined;
            dispatch(
                eventCompanyActions.setInitCompanyStatus({
                    bitrixId: statusBtrixId,
                    items: clientStatusPField.items,
                    current: statusCurrent,
                    field: clientStatusPField,
                }),
            );
        }
    };

/** Переключение цвета компании (оптимистично) + запись в Bitrix. */
export const setCurrentColor =
    (color: CompanyColorType) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const company = state.app.bitrix.company;
        const colorState = state.company.color;

        if (!company || colorState.isLoading) return;

        dispatch(
            eventCompanyActions.setIsLoading({
                isLoading: true,
                type: EV_COMPANY_PROP.COLOR,
            }),
        );

        const current = colorState.items.find(fi => fi.code == color);
        if (current) {
            dispatch(eventCompanyActions.setCurrentColor({ color }));
            await Bitrix.getService().company.update(company.ID, {
                [colorState.bitrixId]: current.bitrixId,
            });
        }

        dispatch(
            eventCompanyActions.setIsLoading({
                isLoading: false,
                type: EV_COMPANY_PROP.COLOR,
            }),
        );
    };

/** Обновление произвольного портального поля компании (статус и т.п.). */
export const updateCompany =
    (type: EV_COMPANY_PROP, code: CompanyColorType | string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const company = state.app.bitrix.company;
        const targetState = state.company[type];

        if (!company || targetState.isLoading) return;

        dispatch(eventCompanyActions.setIsLoading({ isLoading: true, type }));

        const current = targetState.items.find(fi => fi.code == code);
        if (current) {
            const result = await Bitrix.getService().company.update(company.ID, {
                [targetState.bitrixId]: current.bitrixId,
            });
            if (result) {
                dispatch(eventCompanyActions.setCurrentProp({ code, type }));
            }
        }

        dispatch(eventCompanyActions.setIsLoading({ isLoading: false, type }));
    };
