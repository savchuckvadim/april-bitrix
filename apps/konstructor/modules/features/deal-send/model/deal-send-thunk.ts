import type { AppThunk } from '@/modules/app/model/store';
import { appActions } from '@/modules/app/model/AppSlice';
import { selectCatalog } from '@/modules/entities/catalog';
import { readDeal } from '@/modules/entities/deal';
import { isPortalFieldMultiple } from '@/modules/entities/portal';
import { dealProductRowsBlocker, selectDealProductRows } from '@/modules/entities/offer-document';
import { findMainRow } from '@/modules/entities/row-set';
import {
    buildServiceOfferTitle,
    selectServiceTarget,
    serviceOfferActions,
} from '@/modules/entities/service-offer';
import { saveSnapshot, selectSnapshotSaveError } from '@/modules/entities/snapshot';
import { DealSendHelper } from '../lib/api/deal-send-helper';
import { buildDealSendRequest } from '../lib/build-deal-send.util';
import {
    contractTypeWarning,
    dealWriteError,
    dealWriteWarning,
    toDealSendWarnings,
    type DealSendWarning,
} from '../lib/deal-send-warnings.util';
import { waitForDealWrite, type DealWriteOutcome } from '../lib/deal-write-status.util';
import { resolveRequestKey } from '../lib/request-key.util';
import { dealSendActions } from './DealSendSlice';

const helper = new DealSendHelper();

/**
 * Дожидается записи полей и строк: бэк ставит её в очередь и отдаёт operationId.
 * Нет operationId и нет отметки «не поставлено» — писать было нечего.
 */
const awaitWrite = async (
    response: Awaited<ReturnType<DealSendHelper['send']>>,
    onWriting: () => void,
): Promise<DealWriteOutcome> => {
    if (response.operationId) {
        onWriting();
        return waitForDealWrite(response.operationId, id => helper.status(id));
    }
    if (response.warnings?.includes('write_not_queued')) {
        return { kind: 'failed', reason: 'запись не поставлена в очередь' };
    }
    return { kind: 'written' };
};

/**
 * «Сохранить сделку» (легаси sendDeal) — единственное сохранение: поля и
 * товарные строки → бэк (создаёт сделку, если её нет; запись — очередью),
 * затем слепок v2 сделки со всеми наборами (+ открытый вариант — по
 * saveDone-слушателю). Незаписанные поля — предупреждением с адресом правки.
 * Когда варианты продаются вместе, в сделку идут строки всех участников;
 * участник, которого собрать нельзя, блокирует запись текстом ошибки отправки.
 *
 * Из компании без сделки отправка создаёт её: попытка идёт с requestKey (после
 * сбоя повтор берёт тот же ключ), созданная сделка читается из Битрикса и
 * кладётся в приложение — дальше оно работает как внутри этой сделки. Итог
 * записи полей ждём по operationId: «готово» означает, что поля легли в сделку.
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
    // варианты продаются вместе: участник, которого собрать нельзя, остановил бы
    // сделку с неполной суммой, поэтому запись ждёт, пока менеджер его поправит
    const variantsBlocker = dealProductRowsBlocker(state);
    if (variantsBlocker) {
        dispatch(dealSendActions.failed(variantsBlocker));
        return false;
    }

    const serviceTarget = selectServiceTarget(state);
    const requestKey = resolveRequestKey(dealId, state.dealSend.requestKey);
    dispatch(dealSendActions.started({ requestKey }));
    try {
        const request = buildDealSendRequest({
            domain,
            dealId,
            userId: Number(bitrix.user?.ID) || null,
            companyId: Number(bitrix.company?.ID) || null,
            dealName: bitrix.deal?.TITLE || bitrix.company?.TITLE || 'Сделка из конструктора',
            requestKey,
            catalog: selectCatalog(state),
            general,
            mainRow,
            // поля сделки идут от живого состояния; строки собраны по всем участникам,
            // когда варианты продаются вместе
            productRows: selectDealProductRows(state).rows,
            providerName: state.documentProvider.current?.name ?? null,
            serviceDepartment: Boolean(state.rowSet.context.serviceDepartment),
            // НПА: законодательство региона клиента; в множественное поле — всех регионов состава
            clientRegionCode: state.rowSet.context.regionCode,
            npaMultiple: isPortalFieldMultiple(state.portal.current, 'npa', serviceTarget ? 'service_offer' : 'deal'),
            // сервисный отдел, «следующий период» → элемент смарта service_offer
            target: serviceTarget
                ? { ...serviceTarget, title: buildServiceOfferTitle(selectCatalog(state), mainRow) }
                : undefined,
        });
        const response = await helper.send(request);
        if (response.created) {
            // слепок ниже пишется уже с новым dealId; ключ попытки отработал
            dispatch(appActions.setDealId(response.dealId));
            dispatch(dealSendActions.dealCreated());
        }
        if (response.smartId) dispatch(serviceOfferActions.setSmartId(response.smartId));
        // слепок сделки — после отправки: сделка уже есть, dealId известен
        const saved = await dispatch(saveSnapshot());
        const write = await awaitWrite(response, () => dispatch(dealSendActions.writing()));
        // созданную сделку читаем после записи полей: в ней уже лежит всё, что ушло.
        // Не прочиталась — приложение работает по одному dealId, как раньше.
        if (response.created) {
            const deal = await readDeal(response.dealId);
            if (deal) dispatch(appActions.setDeal(deal));
        }

        if (!saved) {
            const reason = selectSnapshotSaveError(getState()) ?? 'ошибка сохранения';
            dispatch(dealSendActions.failed(`Сделка записана, предложение не сохранилось: ${reason}`));
            return false;
        }
        if (write.kind === 'failed') {
            dispatch(
                dealSendActions.failed(dealWriteError(write.reason, response.dealId, response.created)),
            );
            return false;
        }
        const contractWarning = contractTypeWarning(selectCatalog(state), mainRow);
        const writeWarning: DealSendWarning[] =
            write.kind === 'pending' || write.kind === 'unknown' ? [dealWriteWarning(write.kind)] : [];
        dispatch(
            dealSendActions.done({
                dealId: response.dealId,
                created: response.created,
                warnings: [
                    ...(contractWarning ? [contractWarning] : []),
                    ...toDealSendWarnings(response.skipped),
                    ...writeWarning,
                ],
            }),
        );
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
