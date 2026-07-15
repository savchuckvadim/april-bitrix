import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Portal } from '@/modules/app/types/portal/portal-type';
import { Bitrix } from '@workspace/bitrix';
import { EV_COMPANY_PROP, eventCompanyActions } from './EventCompanySlice';
import { CompanyColorType } from '../utils/event-company-util';

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

        const colorPField = pFields.find(pf => pf.code == 'op_prospects');
        const clientStatusPField = pFields.find(pf => pf.code == 'op_client_status');

        if (colorPField) {
            const colorBtrixId = `UF_CRM_${colorPField.bitrixId}`;
            const colorCurrentId = (company as unknown as Record<string, unknown>)[colorBtrixId];
            const colorCurrent = colorPField.items.find(
                pfi => pfi.bitrixId == colorCurrentId,
            );
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
            const statusBtrixId = `UF_CRM_${clientStatusPField.bitrixId}`;
            const statusCurrentId = (company as unknown as Record<string, unknown>)[statusBtrixId];
            const statusCurrent = clientStatusPField.items.find(
                pfi => pfi.bitrixId == statusCurrentId,
            );
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
