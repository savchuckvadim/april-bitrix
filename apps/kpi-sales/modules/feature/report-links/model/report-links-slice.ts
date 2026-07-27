import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ShareLinkDto } from '@workspace/nest-kpi-report-sales-api';

export interface ReportLinksState {
    links: ShareLinkDto[];
    isLoading: boolean;
    isCreating: boolean;
    /** Токен ссылки, над которой идёт действие (отзыв/обновление). */
    mutatingToken: string | null;
    /** Токен только что созданной ссылки — для показа «скопировано». */
    createdToken: string | null;
    /** Открыта ли стеклянная карточка со всеми ссылками. */
    isManageOpen: boolean;
    /** Открыт ли диалог создания. */
    isCreateOpen: boolean;
    error: string | null;
}

const initialState: ReportLinksState = {
    links: [],
    isLoading: false,
    isCreating: false,
    mutatingToken: null,
    createdToken: null,
    isManageOpen: false,
    isCreateOpen: false,
    error: null,
};

const reportLinksSlice = createSlice({
    name: 'reportLinks',
    initialState,
    reducers: {
        setLoading: (state: ReportLinksState, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setLinks: (state: ReportLinksState, action: PayloadAction<ShareLinkDto[]>) => {
            state.links = action.payload;
            state.isLoading = false;
        },
        setCreating: (state: ReportLinksState, action: PayloadAction<boolean>) => {
            state.isCreating = action.payload;
        },
        setMutatingToken: (state: ReportLinksState, action: PayloadAction<string | null>) => {
            state.mutatingToken = action.payload;
        },
        /**
         * Ссылка создана: в начало списка + пометка для «скопировано».
         * Диалог НЕ закрываем — он показывает success-баннер с кнопками
         * «Создать ещё» / «Готово».
         */
        linkCreated: (state: ReportLinksState, action: PayloadAction<ShareLinkDto>) => {
            state.links = [action.payload, ...state.links];
            state.createdToken = action.payload.token;
            state.isCreating = false;
        },
        /** Ответ мутации (revoke/refresh/update) — заменить в списке. */
        linkUpdated: (state: ReportLinksState, action: PayloadAction<ShareLinkDto>) => {
            const updated = action.payload;
            state.links =
                updated.status === 'active'
                    ? state.links.map(l =>
                          l.token === updated.token ? updated : l,
                      )
                    : state.links.filter(l => l.token !== updated.token);
            state.mutatingToken = null;
        },
        clearCreatedToken: (state: ReportLinksState) => {
            state.createdToken = null;
        },
        setManageOpen: (state: ReportLinksState, action: PayloadAction<boolean>) => {
            state.isManageOpen = action.payload;
        },
        setCreateOpen: (state: ReportLinksState, action: PayloadAction<boolean>) => {
            state.isCreateOpen = action.payload;
            // Открытие — всегда с чистой формой, без прошлого успеха/ошибки
            if (action.payload) {
                state.error = null;
                state.createdToken = null;
            }
        },
        setError: (state: ReportLinksState, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isCreating = false;
            state.mutatingToken = null;
        },
        /** Живой онлайн-счётчик по WS (share:presence) для конкретной ссылки. */
        setLinkOnline: (
            state: ReportLinksState,
            action: PayloadAction<{ token: string; online: number }>,
        ) => {
            const link = state.links.find(
                l => l.token === action.payload.token,
            );
            if (link) link.onlineCount = action.payload.online;
        },
    },
});

export const reportLinksActions = reportLinksSlice.actions;
export const reportLinksReducer = reportLinksSlice.reducer;
