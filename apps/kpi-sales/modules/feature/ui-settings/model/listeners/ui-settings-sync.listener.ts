import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { appActions } from '@/modules/app/model/AppSlice';
import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { UI_SETTINGS_TOUCH_EVENT } from '@/modules/shared/lib/ui-settings-touch';
import { conversionsActions } from '@/modules/feature/report-conversions';
import { mergedReportActions } from '@/modules/feature/merged-kpi-calling-report';
import { reportTypeActions } from '@/modules/feature/report-widget-type/model/ReportTypeSlice';
import { financeActions } from '@/modules/entities/finance';
import { UiSettingsHelper } from '../../lib/api/ui-settings-helper';
import type { UiSettingsBlob } from '../../lib/ui-settings.types';
import {
    applyBlobToLocalStores,
    collectBlockStates,
    collectChartSelections,
    loadUiSettingsCache,
    saveUiSettingsCache,
} from '../../lib/ui-settings-storage.util';
import { uiSettingsActions } from '../ui-settings-slice';

const uiSettingsHelper = new UiSettingsHelper();

/** Дебаунс автосохранения: настройки часто кликаются сериями. */
const SAVE_DEBOUNCE_MS = 1200;

let touchEventWired = false;

const identity = (
    state: RootState,
): { domain: string; userId: number } | null => {
    // Режим «Смотреть как…» (superuser): синк полностью выключен — ни
    // чтения чужого блоба, ни записи. Иначе экранные крутилки суперюзера
    // сохранились бы под id просматриваемого пользователя и перезатёрли
    // его настройки. Свои настройки суперюзера в этом режиме тоже не
    // сейвятся — осознанный компромисс.
    if (state.app.viewAs.user) return null;
    const domain = state.app.domain;
    const userId = Number(state.app.bitrix.user?.ID ?? 0);
    if (!domain || !userId) return null;
    return { domain, userId };
};

/** Сборка блоба из Redux-стейта и локальных хранилищ. */
const buildBlob = (state: RootState): UiSettingsBlob => {
    const { hydrated: _hydrated, ...conversions } = state.conversions;
    return {
        version: 1,
        updatedAt: new Date().toISOString(),
        conversions,
        blocks: collectBlockStates(),
        mergedFilter: {
            selectedUsers: state.mergedReport.selectedUsers,
            selectedActions: state.mergedReport.selectedActions,
        },
        reportType: state.reportType.current,
        chartSelections: collectChartSelections(),
        finance: {
            comparison: state.finance.comparison.mode,
            hotThreshold: state.finance.hot.threshold,
        },
    };
};

/** Применение блоба: Redux-слайсы + сырые localStorage-хранилища. */
const applyBlob = (blob: UiSettingsBlob, dispatch: AppDispatch): void => {
    applyBlobToLocalStores(blob);
    dispatch(conversionsActions.hydrate(blob.conversions ?? null));
    if (blob.mergedFilter) {
        if (blob.mergedFilter.selectedUsers.length) {
            dispatch(
                mergedReportActions.setSelectedUsers(
                    blob.mergedFilter.selectedUsers,
                ),
            );
        }
        if (blob.mergedFilter.selectedActions.length) {
            dispatch(
                mergedReportActions.setSelectedActions(
                    blob.mergedFilter.selectedActions,
                ),
            );
        }
    }
    if (blob.reportType) {
        dispatch(reportTypeActions.setCurrentReportType(blob.reportType));
    }
    if (blob.finance) {
        dispatch(
            financeActions.hydrateSettings({
                comparison: blob.finance.comparison,
                hotThreshold: blob.finance.hotThreshold,
            }),
        );
    }
};

const parseBlob = (raw: string | null | undefined): UiSettingsBlob | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as UiSettingsBlob;
        return parsed?.version === 1 ? parsed : null;
    } catch {
        return null;
    }
};

const isNewer = (
    candidate: UiSettingsBlob,
    base: UiSettingsBlob | null,
): boolean => !base || candidate.updatedAt > base.updatedAt;

/**
 * Синк UI-настроек: localStorage — кэш (мгновенная гидратация),
 * бэк — источник истины между браузерами (report_settings.other).
 *
 * Гидратация на setAppData: кэш применяется сразу; ответ бэка — если
 * свежее кэша; бэк пуст — сеем его текущим локальным состоянием.
 * Автосейв: любое изменение настроек → дебаунс → localStorage + POST.
 */
export const startUiSettingsSyncListeners = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (_action, { dispatch, getState }) => {
            // Мост для не-Redux хранилищ (блоки, выборы графиков).
            if (!touchEventWired && typeof window !== 'undefined') {
                touchEventWired = true;
                window.addEventListener(UI_SETTINGS_TOUCH_EVENT, () =>
                    dispatch(uiSettingsActions.touched()),
                );
            }

            const id = identity(getState());
            if (!id) {
                dispatch(uiSettingsActions.setHydrated());
                return;
            }

            const local = loadUiSettingsCache(id.domain, id.userId);
            if (local) applyBlob(local, dispatch);

            try {
                const remote = await uiSettingsHelper.get(
                    id.domain,
                    id.userId,
                );
                const remoteBlob = parseBlob(remote?.settings);
                if (remoteBlob && isNewer(remoteBlob, local)) {
                    applyBlob(remoteBlob, dispatch);
                    saveUiSettingsCache(id.domain, id.userId, remoteBlob);
                } else if (!remoteBlob) {
                    // Первый вход с этого домена+юзера: сеем бэк текущим
                    // локальным состоянием (миграция со старых ключей).
                    const seed = local ?? buildBlob(getState());
                    saveUiSettingsCache(id.domain, id.userId, seed);
                    await uiSettingsHelper.save(
                        id.domain,
                        id.userId,
                        JSON.stringify(seed),
                    );
                }
            } catch {
                // Бэк недоступен — работаем на localStorage-кэше.
            }

            if (!local) {
                // Конверсии могли не гидратироваться (нет ни кэша, ни бэка).
                if (!getState().conversions.hydrated) {
                    dispatch(conversionsActions.hydrate(null));
                }
            }
            dispatch(uiSettingsActions.setHydrated());
        },
    });

    listener.startListening({
        matcher: isAnyOf(
            conversionsActions.setTableConfig,
            conversionsActions.setWidgetConfig,
            conversionsActions.setTabConfig,
            mergedReportActions.setSelectedUsers,
            mergedReportActions.setSelectedActions,
            reportTypeActions.setCurrentReportType,
            financeActions.setComparisonMode,
            financeActions.setHotThreshold,
            uiSettingsActions.touched,
        ),
        effect: async (_action, listenerApi) => {
            const state = listenerApi.getState();
            if (!state.uiSettings.hydrated) return;
            const id = identity(state);
            if (!id) return;

            listenerApi.cancelActiveListeners();
            await listenerApi.delay(SAVE_DEBOUNCE_MS);

            const blob = buildBlob(listenerApi.getState());
            saveUiSettingsCache(id.domain, id.userId, blob);
            try {
                await uiSettingsHelper.save(
                    id.domain,
                    id.userId,
                    JSON.stringify(blob),
                );
            } catch {
                // Бэк недоступен — кэш сохранён, доедет при следующем сейве.
            }
        },
    });
};
