import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { LeadRequestCard } from '@/modules/features/LeadRequestCard/model';
import type {
    PresentationLeadCandidate,
    PresentationSyncSiteStageCode,
    PresentationSyncSiteStatusCode,
} from './index';

export type PresentationLeadLinkStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PresentationLeadLinkState {
    /** Модалка открыта (обязательный шаг перед отправкой). */
    isOpen: boolean;
    /** Отправка ждёт ответа модалки (паттерн CheckPresentation). */
    pendingSend: boolean;
    candidates: PresentationLeadCandidate[];
    candidatesStatus: PresentationLeadLinkStatus;
    /** Выбранный лид; null при «не связана» или пока не выбран. */
    selectedLeadId: number | null;
    /** Явный выбор «презентация не связана с заявкой». */
    noLink: boolean;
    /** Карточка выбранного лида — варианты статусов с портальными названиями. */
    card: LeadRequestCard | null;
    cardStatus: PresentationLeadLinkStatus;
    siteStatusCode: PresentationSyncSiteStatusCode | null;
    siteStageCode: PresentationSyncSiteStageCode | null;
    /** Вопрос закрыт для текущего отчёта — отправка больше не перехватывается. */
    resolved: boolean;
}

const initialState: PresentationLeadLinkState = {
    isOpen: false,
    pendingSend: false,
    candidates: [],
    candidatesStatus: 'idle',
    selectedLeadId: null,
    noLink: false,
    card: null,
    cardStatus: 'idle',
    siteStatusCode: null,
    siteStageCode: null,
    resolved: false,
};

/**
 * Связь «презентация ↔ заявка»: обязательный вопрос перед отправкой отчёта
 * с фактом презентации при открытых заявках клиента. Выбор и статусы уезжают
 * в EventSalesFlowDto.leadSync (см. build-flow-payload).
 */
const presentationLeadLinkSlice = createSlice({
    name: 'presentationLeadLink',
    initialState,
    reducers: {
        opened(state, action: PayloadAction<{ pendingSend: boolean }>) {
            state.isOpen = true;
            state.pendingSend = action.payload.pendingSend;
            state.candidatesStatus = 'loading';
        },
        candidatesLoaded(
            state,
            action: PayloadAction<PresentationLeadCandidate[]>,
        ) {
            state.candidates = action.payload;
            state.candidatesStatus = 'ready';
        },
        candidatesFailed(state) {
            state.candidatesStatus = 'error';
        },
        candidateSelected(state, action: PayloadAction<number>) {
            state.selectedLeadId = action.payload;
            state.noLink = false;
            state.cardStatus = 'loading';
            state.card = null;
            state.siteStatusCode = null;
            state.siteStageCode = null;
        },
        noLinkSelected(state) {
            state.noLink = true;
            state.selectedLeadId = null;
            state.card = null;
            state.cardStatus = 'idle';
        },
        cardLoaded(state, action: PayloadAction<LeadRequestCard>) {
            state.card = action.payload;
            state.cardStatus = 'ready';
            // Префилл текущими значениями лида — менеджер их подтверждает
            // или меняет; пустые обязан заполнить (валидация confirm).
            state.siteStatusCode =
                action.payload.siteStatus.currentCode ?? null;
            state.siteStageCode = action.payload.siteStage.currentCode ?? null;
        },
        cardFailed(state) {
            state.cardStatus = 'error';
        },
        setSiteStatusCode(
            state,
            action: PayloadAction<PresentationSyncSiteStatusCode>,
        ) {
            state.siteStatusCode = action.payload;
        },
        setSiteStageCode(
            state,
            action: PayloadAction<PresentationSyncSiteStageCode>,
        ) {
            state.siteStageCode = action.payload;
        },
        resolvedAndClosed(state) {
            state.resolved = true;
            state.isOpen = false;
            state.pendingSend = false;
        },
        closed(state) {
            state.isOpen = false;
            state.pendingSend = false;
        },
        resetForNewEvent: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const presentationLeadLinkActions: {
    opened: ActionCreatorWithPayload<
        { pendingSend: boolean },
        'presentationLeadLink/opened'
    >;
    candidatesLoaded: ActionCreatorWithPayload<
        PresentationLeadCandidate[],
        'presentationLeadLink/candidatesLoaded'
    >;
    candidatesFailed: ActionCreatorWithoutPayload<'presentationLeadLink/candidatesFailed'>;
    candidateSelected: ActionCreatorWithPayload<
        number,
        'presentationLeadLink/candidateSelected'
    >;
    noLinkSelected: ActionCreatorWithoutPayload<'presentationLeadLink/noLinkSelected'>;
    cardLoaded: ActionCreatorWithPayload<
        LeadRequestCard,
        'presentationLeadLink/cardLoaded'
    >;
    cardFailed: ActionCreatorWithoutPayload<'presentationLeadLink/cardFailed'>;
    setSiteStatusCode: ActionCreatorWithPayload<
        PresentationSyncSiteStatusCode,
        'presentationLeadLink/setSiteStatusCode'
    >;
    setSiteStageCode: ActionCreatorWithPayload<
        PresentationSyncSiteStageCode,
        'presentationLeadLink/setSiteStageCode'
    >;
    resolvedAndClosed: ActionCreatorWithoutPayload<'presentationLeadLink/resolvedAndClosed'>;
    closed: ActionCreatorWithoutPayload<'presentationLeadLink/closed'>;
    resetForNewEvent: ActionCreatorWithoutPayload<'presentationLeadLink/resetForNewEvent'>;
} = presentationLeadLinkSlice.actions;

export const presentationLeadLinkReducer: Reducer<PresentationLeadLinkState> =
    presentationLeadLinkSlice.reducer;
