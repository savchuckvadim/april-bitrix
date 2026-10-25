import type { AppThunk } from '@/modules/app/model/store';
import { appActions } from '@/modules/app/model/AppSlice';
import { selectCatalog } from '@/modules/entities/catalog';
import { syncOpenComplectVariant } from '@/modules/entities/complect-variant';
import { findMainRow } from '@/modules/entities/row-set';
import {
    buildServiceOfferTitle,
    selectServiceTarget,
    serviceOfferActions,
} from '@/modules/entities/service-offer';
import { saveSnapshot } from '@/modules/entities/snapshot';
import { DealSendHelper } from '../lib/api/deal-send-helper';
import { buildDealSendRequest } from '../lib/build-deal-send.util';
import { dealSendActions } from './DealSendSlice';

const helper = new DealSendHelper();

/**
 * «Сохранить сделку» (легаси sendDeal): поля и товарные строки → бэк
 * (создаёт сделку, если её нет; запись — очередью), затем слепок v2 сделки
 * (+ открытый вариант — по saveDone-слушателю). Поля, которых нет на портале,
 * бэк возвращает в skipped — показываем предупреждением, не ошибкой.
 */
export const sendDeal = (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
    const state = getState();
    const { domain, dealId, bitrix } = state.app;
    const general = state.rowSet.general;
    const mainRow = findMainRow(general);
    if (!domain || !mainRow) {
        dispatch(dealSendActions.failed('Нечего отправлять: нет главной строки'));
        return false;
    }

    const serviceTarget = selectServiceTarget(state);
    dispatch(dealSendActions.started());
    try {
        const request = buildDealSendRequest({
            domain,
            dealId,
            userId: Number(bitrix.user?.ID) || null,
            companyId: Number(bitrix.company?.ID) || null,
            dealName: bitrix.deal?.TITLE || bitrix.company?.TITLE || 'Сделка из конструктора',
            catalog: selectCatalog(state),
            general,
            mainRow,
            providerName: state.documentProvider.current?.name ?? null,
            // сервисный отдел, «следующий период» → элемент смарта service_offer
            target: serviceTarget
                ? { ...serviceTarget, title: buildServiceOfferTitle(selectCatalog(state), mainRow) }
                : undefined,
        });
        const response = await helper.send(request);
        if (response.created) dispatch(appActions.setDealId(response.dealId));
        if (response.smartId) dispatch(serviceOfferActions.setSmartId(response.smartId));
        dispatch(
            dealSendActions.done({
                dealId: response.dealId,
                created: response.created,
                skipped: response.skipped.map(item => item.code),
            }),
        );
        // слепок сделки — после отправки: сделка уже есть, dealId известен
        await dispatch(saveSnapshot());
        void dispatch(syncOpenComplectVariant());
        return true;
    } catch (error) {
        dispatch(
            dealSendActions.failed(
                error instanceof Error ? error.message : 'сделка не отправлена',
            ),
        );
        return false;
    }
};
