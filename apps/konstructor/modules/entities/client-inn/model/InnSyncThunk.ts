import type { AppThunk } from '@/modules/app/model/store';
import { appActions } from '@/modules/app/model/AppSlice';
import { InnSetHelper } from '../lib/api/inn-set-helper';
import { buildInnPatches } from '../lib/build-inn-sync-plan.util';
import { selectInnSyncPlan } from './selectors';
import type { InnSyncResult } from './types';

const helper = new InnSetHelper();

/** Записи, которые идут прямо сейчас: одно и то же не шлём дважды. */
const inFlight = new Set<string>();
/** Бэк без ручки записи ИНН (ответ 404/405): до перезагрузки страницы не пробуем. */
let isEndpointMissing = false;

/** Для тестов: забыть, что запись шла и что ручки не нашли. */
export const resetInnSyncMemory = () => {
    inFlight.clear();
    isEndpointMissing = false;
};

const isMissingEndpointError = (error: unknown): boolean => {
    const status = (error as { response?: { status?: number } } | null)?.response?.status;
    return status === 404 || status === 405;
};

/**
 * ИНН текущего реквизита становится текущим ИНН сделки и компании и входит в
 * их пул (пул только пополняется). Пишет бэк единым писателем ИНН: он
 * объединяет пул, пишет в ленту сделки и не даёт терять прежние значения;
 * поля ИНН из браузера не пишем. Шапка от записи не зависит: она показывает ИНН
 * текущего реквизита сразу (`selectCurrentRequisiteInn`).
 *
 * После ответа правим сущности в сторе тем, что записал бэк, чтобы следующая
 * проверка видела новое. Сбой не ломает работу: запись повторится при
 * следующей смене реквизита.
 */
export const syncCurrentInn =
    (): AppThunk<Promise<InnSyncResult>> => async (dispatch, getState) => {
        if (isEndpointMissing) return 'unavailable';
        const plan = selectInnSyncPlan(getState());
        if (!plan) return 'skipped';

        const key = [
            plan.request.domain,
            plan.request.dealId ?? 0,
            plan.request.companyId ?? 0,
            plan.inn,
        ].join(':');
        if (inFlight.has(key)) return 'skipped';
        inFlight.add(key);
        try {
            const result = await helper.set(plan.request);
            const patches = buildInnPatches(plan, result.entity);
            if (patches.company) dispatch(appActions.patchCompany(patches.company));
            if (patches.deal) dispatch(appActions.patchDeal(patches.deal));
            if (result.warnings.length) {
                console.warn('client-inn: ИНН записан с предупреждениями', result.warnings);
            }
            return 'written';
        } catch (error) {
            if (isMissingEndpointError(error)) {
                isEndpointMissing = true;
                console.warn('client-inn: на бэке нет ручки записи ИНН, пул не пополнен');
                return 'unavailable';
            }
            console.error('client-inn: ИНН не записан', error);
            return 'failed';
        } finally {
            inFlight.delete(key);
        }
    };
