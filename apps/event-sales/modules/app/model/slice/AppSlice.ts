import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { APP_DISPLAY_MODE, APP_TYPE } from '../../types/app/app-type';
import {
    BXCompany,
    BXDeal,
    BXLead,
    BXTask,
    BXUser,
    Placement,
} from '@workspace/bx';
import {
    DomainFeatureConfig,
    getDomainConfig,
} from '../../consts/domain-config';

export type AppState = typeof initialState;

export enum APP_DEP {
    SALES = 'sales',
    SERVICE = 'service',
}
export enum APP_FROM_ENUM {
    COMPANY = 'company',
    LEAD = 'lead',
    DEAL = 'deal', // имеется в виду только deal_empty -
    // DEAL_EMPTY = 'deal_empty',
    // DEAL_WITH_COMPANY = 'deal_with_company',
    // TASK = 'task', // не имеет смысла мы на основе информации из task должны выбрать
    //предыдущие
    // CALL_CARD = 'call_card',
}
/**
 * Полноэкранные заглушки-гварды вместо приложения (todo2508):
 * - `foreignTask` — открылись из задачи ЧУЖОЙ группы (не «Звонки» ОП);
 * - `noTaskEntity` — у задачи не осталось живых привязок (компания/сделка/лид
 *   удалены) — работать не с чем.
 */
export type AppGuard = 'foreignTask' | 'noTaskEntity';

const initialState = {
    domain: '',
    app: APP_TYPE.EVENT as APP_TYPE,
    guard: null as AppGuard | null,
    bitrix: {
        user: null as BXUser | null,
        company: null as BXCompany | null,
        deal: null as BXDeal | null,
        lead: null as BXLead | null,
        placement: null as null | Placement,
        task: null as BXTask | null,
        from: null as APP_FROM_ENUM | null,
    },

    display: {
        mode: APP_DISPLAY_MODE.PUBLIC as APP_DISPLAY_MODE,
    },

    department: APP_DEP.SALES,
    isResized: false,
    initialized: false,
    isLoading: false,
    error: {
        status: false as boolean,
        message: '' as string,
    },
    config: getDomainConfig('') as DomainFeatureConfig,
    /**
     * fetchAppConfig отработал (успехом ИЛИ ошибкой): портальные настройки
     * уже легли поверх хардкода — или их не будет. Потребители, которым
     * настройка нужна к ПЕРВОМУ запросу (initialEventTasks: taskGroupId),
     * ждут этот флаг с таймаутом (fail-open на хардкод).
     */
    isConfigFetched: false as boolean,
    /**
     * Ключи конфига, ЗАДАННЫЕ на портале и применённые (а не взятые из
     * доменного дефолта). Нужны диагностике: «taskGroupId = 9» без
     * источника не отвечает на главный вопрос прода — настройка портала
     * применилась или мы работаем по legacy-хардкоду.
     *
     * Список честный: в патч попадают только ключи из `storedKeys` ответа
     * бэка (lib/config/app-config-patch), то есть те, которые владелец
     * действительно сохранил в админке. Дефолты реестра, приезжающие в том
     * же ответе, сюда не попадают.
     */
    configPortalKeys: [] as string[],
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        isLoading: (
            state: AppState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.isLoading = action.payload.status;
        },
        /**
         * Домен и пользователь известны сразу после Bitrix.start — раньше
         * резолва сущностей плейсмента. Это самая ранняя точка init-цикла:
         * от неё стартуют независимые цепочки (портал, настройки, каталог
         * анкет, отдел — см. app-init.util), и конфиг по домену
         * пересобирается именно здесь, чтобы патч портальных настроек
         * (mergeConfig) лёг ПОВЕРХ доменных дефолтов, а не был стёрт поздним
         * setAppData.
         *
         * Пересборка — на КАЖДЫЙ init-цикл, включая ⟳: сброшенная в админке
         * настройка обязана вернуться к доменному дефолту на следующем
         * запуске (см. комментарий к mergeConfig).
         */
        setDomain: (
            state: AppState,
            action: PayloadAction<{ domain: string; user: BXUser | null }>,
        ) => {
            state.domain = action.payload.domain;
            state.config = getDomainConfig(
                action.payload.domain,
                action.payload.user,
            );
            state.configPortalKeys = [];
        },
        setAppData: (
            state: AppState,
            action: PayloadAction<{
                domain: string;
                user: BXUser | null;
                placement: Placement | null;
                deal: BXDeal | null;
                company: BXCompany | null;
                lead: BXLead | null;
                display: APP_DISPLAY_MODE;
                task: BXTask | null;
                from: APP_FROM_ENUM;
            }>,
        ) => {
            const payload = action.payload;
            // Конфиг по домену пересобрал ранний setDomain, и портальный
            // патч (mergeConfig из кэша настроек) мог уже лечь поверх —
            // пересборка здесь стёрла бы его до прихода фонового обновления.
            // Пересобираем только на ДРУГОМ домене: это запасной путь для
            // циклов без setDomain (юнит-тесты, нештатные вызовы).
            if (state.domain !== payload.domain) {
                state.config = getDomainConfig(payload.domain, payload.user);
                // Конфиг пересобран по домену — портальных ключей в нём нет.
                state.configPortalKeys = [];
            }
            state.domain = payload.domain;
            state.bitrix.placement = payload.placement;
            state.bitrix.user = payload.user;
            state.bitrix.company = payload.company;
            state.bitrix.deal = payload.deal;
            state.bitrix.task = payload.task;
            state.bitrix.lead = payload.lead;
            state.display.mode = payload.display;
            state.bitrix.from = payload.from;
        },
        setAppBitrixData: (
            state: AppState,
            action: PayloadAction<{
                company: null | BXCompany;
                deal: null | BXDeal;
            }>,
        ) => {
            state.bitrix.company = action.payload.company;
            state.bitrix.deal = action.payload.deal;
        },
        /**
         * Портальные настройки с бэка (админка → Settings → event-sales)
         * ложатся ПОВЕРХ доменных дефолтов domain-config: сервер недоступен —
         * остаётся прежнее поведение (безопасный переезд с хардкода).
         *
         * В патче — только то, что владелец задал на портале, поэтому
         * доливать его накопительно безопасно. Обратный ход (настройку в
         * админке СБРОСИЛИ) даёт не merge, а пересборка конфига на
         * setAppData/reload — то есть следующий запуск фрейма.
         */
        mergeConfig: (
            state: AppState,
            action: PayloadAction<Partial<DomainFeatureConfig>>,
        ) => {
            state.config = { ...state.config, ...action.payload };
            state.configPortalKeys = [
                ...new Set([
                    ...state.configPortalKeys,
                    ...Object.keys(action.payload),
                ]),
            ];
        },
        /** fetchAppConfig завершился (и при ошибке тоже — fail-open). */
        setConfigFetched: (state: AppState) => {
            state.isConfigFetched = true;
        },
        setInitializedSuccess: (state: AppState, action: PayloadAction<{}>) => {
            state.initialized = true;
        },
        setInitializedError: (
            state: AppState,
            action: PayloadAction<{ errorMessage: string }>,
        ) => {
            state.initialized = true;
            state.error.status = true;
            state.error.message = action.payload.errorMessage;
        },
        setCleanError: (state: AppState) => {
            state.error.status = false;
            state.error.message = '';
        },
        setGuard: (state: AppState, action: PayloadAction<AppGuard | null>) => {
            state.guard = action.payload;
        },
        reload: (state: AppState) => {
            state.initialized = false;
            state.guard = null;
            /*
             * Флаг «портальные настройки получены» тоже гаснет: иначе
             * повторный запуск не ждёт их и успевает уйти со значениями
             * по домену, а первый — ждёт. Разное поведение первого и
             * повторного запуска маскировало инцидент 27.08 (дела
             * «появлялись» после отправки отчёта).
             */
            state.isConfigFetched = false;
            state.configPortalKeys = [];
        },
    },
});

export const appReducer = appSlice.reducer;
export const appActions = appSlice.actions;
