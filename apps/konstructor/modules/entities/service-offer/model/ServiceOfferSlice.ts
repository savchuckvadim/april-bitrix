import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { APP_DEP, type AppState } from '@/modules/app/model/AppSlice';
import { SERVICE_OFFER_SMART_TYPE, type ServiceOfferStatus, type ServicePeriodMode } from './types';

export interface ServiceOfferState {
    status: ServiceOfferStatus;
    error: string | null;
    /** Какой период открыт в конструкторе */
    mode: ServicePeriodMode;
    /** Элемент смарта «следующего периода»; null — ещё не создан */
    smartId: number | null;
    hasDealSnapshot: boolean;
    hasSmartSnapshot: boolean;
    /** Идёт переключение периода (загрузка слепка) */
    switching: boolean;
}

const initialState: ServiceOfferState = {
    status: 'idle',
    error: null,
    mode: 'deal',
    smartId: null,
    hasDealSnapshot: false,
    hasSmartSnapshot: false,
    switching: false,
};

export const serviceOfferSlice = createSlice({
    name: 'serviceOffer',
    initialState,
    reducers: {
        loading(state: ServiceOfferState) {
            state.status = 'loading';
            state.error = null;
        },
        loaded(
            state: ServiceOfferState,
            action: PayloadAction<{ smartId: number | null; hasDealSnapshot: boolean; hasSmartSnapshot: boolean }>,
        ) {
            state.smartId = action.payload.smartId;
            state.hasDealSnapshot = action.payload.hasDealSnapshot;
            state.hasSmartSnapshot = action.payload.hasSmartSnapshot;
            state.status = 'ready';
        },
        failed(state: ServiceOfferState, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
            state.switching = false;
        },
        setMode(state: ServiceOfferState, action: PayloadAction<ServicePeriodMode>) {
            state.mode = action.payload;
        },
        /** Смарт создан отправкой (deal-send target smart) */
        setSmartId(state: ServiceOfferState, action: PayloadAction<number | null>) {
            state.smartId = action.payload;
            if (action.payload) state.hasSmartSnapshot = true;
        },
        switching(state: ServiceOfferState, action: PayloadAction<boolean>) {
            state.switching = action.payload;
        },
        /** Новая сделка в плейсменте (setAppData-слушатель) */
        reset() {
            return initialState;
        },
    },
});

export const serviceOfferActions = serviceOfferSlice.actions;
export const serviceOfferReducer = serviceOfferSlice.reducer;

interface WithServiceOffer {
    serviceOffer: ServiceOfferState;
    app: AppState;
}

export const selectServiceOffer = (state: WithServiceOffer) => state.serviceOffer;
export const selectServicePeriod = (state: WithServiceOffer) => state.serviceOffer.mode;

/** Открыт «следующий период» сервисного отдела: документы и отправка идут в смарт. */
export const selectIsServiceSmartMode = (state: WithServiceOffer): boolean =>
    state.app.department === APP_DEP.SERVICE && state.serviceOffer.mode === 'smart';

/** Элемент смарта для слепка/заявки: только в режиме «следующий период» */
export const selectServiceSmartId = (state: WithServiceOffer): number | null =>
    selectIsServiceSmartMode(state) ? state.serviceOffer.smartId : null;

/** Куда отправлять сборку: смарт service_offer или сделка (target не нужен). */
export const selectServiceTarget = (
    state: WithServiceOffer,
): { kind: 'smart'; smartType: string; smartId: number | null } | null =>
    selectIsServiceSmartMode(state)
        ? { kind: 'smart', smartType: SERVICE_OFFER_SMART_TYPE, smartId: state.serviceOffer.smartId }
        : null;
