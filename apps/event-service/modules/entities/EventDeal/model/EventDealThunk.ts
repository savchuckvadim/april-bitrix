import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Portal } from '@/modules/app/types/portal/portal-type';
import { Bitrix } from '@workspace/bitrix';
import { eventDealActions } from './EventDealSlice';
import { EV_DEAL_PROP, EV_DEAL_FIELD_CODES } from '../type/event-deal-type';
import { normalizeToDateOnly } from '../lib/contract-months.util';

/**
 * Инициализация полей «Действие договора с/по». Сделка берётся из плейсмента
 * (приложение открывают в сделках), а если её нет — ищется базовая сделка ОРК
 * (воронка service_base) по текущей компании. Не нашли — фича неактивна,
 * отправка не блокируется.
 */
export const setInitEventDeal =
    (portal: Portal) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();

        const pFields = portal?.bitrixDeal?.bitrixfields;
        const startField = pFields?.find(
            f => f.code === EV_DEAL_FIELD_CODES[EV_DEAL_PROP.CONTRACT_START],
        );
        const endField = pFields?.find(
            f => f.code === EV_DEAL_FIELD_CODES[EV_DEAL_PROP.CONTRACT_END],
        );
        if (!startField || !endField) {
            dispatch(eventDealActions.clean());
            return;
        }
        const startBitrixId = `UF_CRM_${startField.bitrixId}`;
        const endBitrixId = `UF_CRM_${endField.bitrixId}`;

        let dealId: number | null = null;
        let dealRecord: Record<string, unknown> | null = null;

        const deal = state.app.bitrix.deal;
        if (deal) {
            // DEAL-плейсмент: crm.deal.get без select — все UF_CRM_* уже тут
            dealId = Number(deal.ID);
            dealRecord = deal as unknown as Record<string, unknown>;
        } else {
            // запасной путь: базовая сделка ОРК по компании
            const company = state.app.bitrix.company;
            const baseCategory = portal?.bitrixDeal?.categories?.find(
                c => c.code === 'service_base',
            );
            if (company && baseCategory) {
                try {
                    const response = await Bitrix.getService().deal.getList(
                        {
                            //@ts-ignore фильтр с префиксом равенства
                            '=CATEGORY_ID': baseCategory.bitrixId,
                            COMPANY_ID: String(company.ID),
                        },
                        ['ID', startBitrixId, endBitrixId],
                    );
                    const deals = (response as { result?: unknown })?.result;
                    const found = Array.isArray(deals) ? deals[0] : null;
                    if (found && found.ID) {
                        dealId = Number(found.ID);
                        dealRecord = found as Record<string, unknown>;
                    }
                } catch (e) {
                    // сделки нет или запрос упал — фича просто неактивна
                }
            }
        }

        if (!dealId || !dealRecord) {
            dispatch(eventDealActions.clean());
            return;
        }

        dispatch(
            eventDealActions.setInit({
                dealId,
                contractStart: {
                    bitrixId: startBitrixId,
                    current: normalizeToDateOnly(dealRecord[startBitrixId]),
                },
                contractEnd: {
                    bitrixId: endBitrixId,
                    current: normalizeToDateOnly(dealRecord[endBitrixId]),
                },
            }),
        );
    };

/**
 * Изменение даты договора: пишем в сделку Bitrix сразу (как pbx-поля компании),
 * при успехе фиксируем в сторе. Пишем 'yyyy-MM-dd' — валидно и для Date, и для
 * DateTime поля (станет 00:00 портального времени). Пустое значение в Bitrix
 * не пишем — только локально (отправку заблокирует валидация send()).
 */
export const updateDealContractDate =
    (prop: EV_DEAL_PROP, value: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const dealId = state.eventDeal.dealId;
        const fieldState = state.eventDeal[prop];
        if (!dealId || !fieldState.bitrixId) return;

        if (!value) {
            dispatch(eventDealActions.setCurrentProp({ prop, value: '' }));
            return;
        }

        const result = await Bitrix.getService().deal.update(dealId, {
            [fieldState.bitrixId]: value,
        });
        if (result) {
            dispatch(eventDealActions.setCurrentProp({ prop, value }));
        }
    };
