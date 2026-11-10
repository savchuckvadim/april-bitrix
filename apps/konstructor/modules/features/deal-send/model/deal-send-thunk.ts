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
import { saveSnapshot, selectSnapshotSaveError } from '@/modules/entities/snapshot';
import { DealSendHelper } from '../lib/api/deal-send-helper';
import { buildDealSendRequest } from '../lib/build-deal-send.util';
import { contractTypeWarning, toDealSendWarnings } from '../lib/deal-send-warnings.util';
import { dealSendActions } from './DealSendSlice';

const helper = new DealSendHelper();

/**
 * «Сохранить сделку» (легаси sendDeal) — единственное сохранение: поля и
 * товарные строки → бэк (создаёт сделку, если её нет; запись — очередью),
 * затем слепок v2 сделки со всеми наборами (+ открытый вариант — по
 * saveDone-слушателю). Незаписанные поля — предупреждением с адресом правки.
 */
export const sendDeal = (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
    const state = getState();
    // повторное нажатие, пока идёт отправка, второй запрос не запускает
    if (state.dealSend.status === 'sending') return false;
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
            serviceDepartment: Boolean(state.rowSet.context.serviceDepartment),
            // сервисный отдел, «следующий период» → элемент смарта service_offer
            target: serviceTarget
                ? { ...serviceTarget, title: buildServiceOfferTitle(selectCatalog(state), mainRow) }
                : undefined,
        });
        const response = await helper.send(request);
        if (response.created) dispatch(appActions.setDealId(response.dealId));
        if (response.smartId) dispatch(serviceOfferActions.setSmartId(response.smartId));
        // слепок сделки — после отправки: сделка уже есть, dealId известен
        const saved = await dispatch(saveSnapshot());
        if (!saved) {
            const reason = selectSnapshotSaveError(getState()) ?? 'ошибка сохранения';
            dispatch(dealSendActions.failed(`Сделка записана, предложение не сохранилось: ${reason}`));
            return false;
        }
        const contractWarning = contractTypeWarning(selectCatalog(state), mainRow);
        dispatch(
            dealSendActions.done({
                dealId: response.dealId,
                created: response.created,
                warnings: [
                    ...(contractWarning ? [contractWarning] : []),
                    ...toDealSendWarnings(response.skipped),
                ],
            }),
        );
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
