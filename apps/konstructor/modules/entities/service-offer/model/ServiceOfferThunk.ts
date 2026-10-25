import type { AppThunk } from '@/modules/app/model/store';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { getServiceOfferPbxSmartEntityId } from '../../portal/lib/portal-util';
import { SnapshotHelper, restoreSnapshotRecord } from '../../snapshot';
import { serviceOfferActions } from './ServiceOfferSlice';
import type { ServicePeriodMode } from './types';

const snapshotHelper = new SnapshotHelper();

const errorText = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

/**
 * Сервисный отдел на входе: какие слепки есть у сделки — обычный («текущий
 * период») и со `serviceSmartId` («следующий период»). Смарта на портале
 * нет или отдел не сервисный — ничего не делаем, конструктор работает как раньше.
 */
export const initServiceOffer = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const state = getState();
    const { domain, dealId, department } = state.app;
    if (department !== APP_DEP.SERVICE || !domain || !dealId) return;
    if (!getServiceOfferPbxSmartEntityId(state.portal.current)) return;
    if (state.serviceOffer.status !== 'idle') return;

    dispatch(serviceOfferActions.loading());
    try {
        const records = await snapshotHelper.listSnapshots(domain, dealId);
        const smart = records.find(record => record.serviceSmartId);
        dispatch(
            serviceOfferActions.loaded({
                smartId: smart?.serviceSmartId ?? null,
                hasDealSnapshot: records.some(record => !record.serviceSmartId),
                hasSmartSnapshot: Boolean(smart),
            }),
        );
    } catch (error) {
        dispatch(serviceOfferActions.failed(errorText(error, 'слепки сервисной сделки не загружены')));
    }
};

/**
 * Переключение периода: грузим слепок нужного периода и раскладываем в
 * конструктор. У «следующего периода» слепка ещё нет — текущая сборка
 * становится его стартом (легаси: смарт создавался копией текущей сделки).
 */
export const setServicePeriod =
    (mode: ServicePeriodMode): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        const state = getState();
        const { domain, dealId } = state.app;
        if (state.serviceOffer.mode === mode || !domain || !dealId) return;
        dispatch(serviceOfferActions.switching(true));
        try {
            const smartId = state.serviceOffer.smartId;
            const record =
                mode === 'smart'
                    ? smartId
                        ? await snapshotHelper.getSnapshot(domain, dealId, smartId)
                        : null
                    : await snapshotHelper.getSnapshot(domain, dealId);
            if (record) await dispatch(restoreSnapshotRecord(record));
            dispatch(serviceOfferActions.setMode(mode));
        } catch (error) {
            dispatch(serviceOfferActions.failed(errorText(error, 'период не переключён')));
            return;
        }
        dispatch(serviceOfferActions.switching(false));
    };
