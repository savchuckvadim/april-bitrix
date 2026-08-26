import type { AppDispatch, AppGetState, RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import { PresentationProp } from '@/modules/entities/EventPresentation/model/PresSlice';
import { StagePredictHelper } from '../lib/api/stage-predict-helper';
import type { StagePredictRequest } from './index';
import { stagePredictActions } from './StagePredictSlice';

const helper = new StagePredictHelper();

const toId = (value: unknown): number | undefined => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : undefined;
};

/**
 * Запрос предикта из состояния; null — предикт не нужен (стадийные
 * чек-листы выключены настройками, lead-only контекст).
 *
 * Контекст и алфавит кодов собираются РОВНО как в buildFlowPayload:
 * предикт обязан смотреть на тот же вход, что и реальный прогон, иначе
 * чек-лист показался бы не для той стадии.
 */
export const buildStagePredictRequest = (
    state: RootState,
): StagePredictRequest | null => {
    const config = state.app.config;
    if (!config.withChecklistDecision && !config.withChecklistSale) {
        return null;
    }

    const companyId = toId(state.app.bitrix.company?.ID);
    const dealId = toId(state.app.bitrix.deal?.ID);
    if (!companyId && !dealId) return null; // lead-only: сделки не двигаются

    const workStatus =
        state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current.code;
    // «Не ЦА» по проводам едет отказом — тем же алфавитом, что flow.
    const wireWorkStatus: StagePredictRequest['workStatusCode'] =
        workStatus === 'notCa' ? 'fail' : workStatus;
    const isNotCa = workStatus === 'notCa';
    const presentation = state.eventPresentation;
    const plan = state.eventPlan;

    return {
        domain: state.app.domain,
        context: {
            companyId,
            dealId,
            leadId: toId(
                state.app.bitrix.lead?.ID ?? state.eventLead.lead?.ID,
            ),
        },
        planEventType:
            plan[EV_PLAN_PROP.IS_ACTIVE] && plan[EV_PLAN_PROP.TYPE].current
                ? plan[EV_PLAN_PROP.TYPE].current.code
                : undefined,
        reportEventType: state.eventTask.current?.eventType ?? undefined,
        // Значения EventItemResultType буквально совпадают с контрактом
        // (result/noresult/expired/new/cancel) — enum номинален, отсюда каст.
        resultStatus: (state.eventItemMenu.type ??
            undefined) as StagePredictRequest['resultStatus'],
        workStatusCode: wireWorkStatus,
        isNotCa: isNotCa || undefined,
        isUnplannedPresentation:
            presentation[PresentationProp.IS_PRESENTATION_DONE] ||
            presentation[PresentationProp.IS_UNPLANNED_PRESENTATION] ||
            undefined,
    };
};

/**
 * Предикт стадии с кэшем по ключу запроса: тот же вход при статусе
 * ready/loading — запрос не повторяется; ответ на устаревший ключ слайс
 * отбрасывает сам (latest-wins).
 */
export const fetchStagePredict =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const request = buildStagePredictRequest(state);
        if (!request) {
            if (state.stagePredict.status !== 'idle') {
                dispatch(stagePredictActions.cleared());
            }
            return;
        }

        const requestKey = JSON.stringify(request);
        const current = state.stagePredict;
        if (
            current.requestKey === requestKey &&
            (current.status === 'ready' || current.status === 'loading')
        ) {
            return;
        }

        dispatch(stagePredictActions.pending({ requestKey }));
        try {
            const result = await helper.predict(request);
            dispatch(stagePredictActions.fulfilled({ requestKey, result }));
        } catch (error) {
            console.warn('stage-predict недоступен', error);
            dispatch(stagePredictActions.failed({ requestKey }));
        }
    };

/**
 * Дождаться актуального предикта перед send(): без него шаг стадийных
 * чек-листов мог бы проскочить, пока запрос в полёте. Ошибка/недоступность
 * не блокирует отправку — сервер-гард продажи проверит DTO сам.
 */
export const ensureStagePredict =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        await dispatch(fetchStagePredict());
        // fetchStagePredict сам ждёт ответ (await helper.predict), поэтому
        // здесь состояние уже settled: ready | error | idle.
        return getState().stagePredict;
    };
