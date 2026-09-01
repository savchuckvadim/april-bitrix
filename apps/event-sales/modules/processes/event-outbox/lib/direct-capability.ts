import { readSwrCache } from '@workspace/api';
// type-only: стирается компилятором, ленивость пакета прямого пути не ломает.
import type {
    DirectCapabilityMap,
    EventFieldPolicySettings,
    FlowSettings,
} from '@workspace/event-sales-flow';

import type { PortalAppSettings } from '@/modules/app/lib/api/app-config-helper';
import {
    getAppConfigCacheKey,
    isAppSettingsPayload,
} from '@/modules/app/lib/cache/app-config-cache';

/**
 * Карта прав прямого исполнения (доктрина плана А4) и сборка FlowSettings
 * для пакета @workspace/event-sales-flow — из тех же настроек портала,
 * которые читает бэковый use-case (`PortalAppSettingsService.resolve`):
 * фронт держит их слепок в swr-кэше `/app-settings/event-sales`
 * (AppConfigThunk), в Redux-конфиге (DomainFeatureConfig) этих ключей нет.
 */

/**
 * Дефолты карты прав — ВСЕ флаги выключены (отсутствие права ≡ запрету):
 * - смарты — роли неизвестны, всегда досылкой;
 * - KPI-список и воронки «Презентации»/«ХО» — у менеджеров нет доступа;
 * - lead-request-sync и im-уведомление о переносе — флаги «на потом».
 * Напрямую исполняется только ядро: entity-flow, company-backfill,
 * task-flow с чек-листами, history/timeline, return-to-tmc, post-fail,
 * lead-relation. Включение любого права — осознанным конфигом, не здесь.
 */
export const DIRECT_CAPABILITY_DEFAULTS: DirectCapabilityMap = {
    allowSmartWrites: false,
    allowKpiWrites: false,
    allowPresDealWrites: false,
    allowXoDealWrites: false,
    allowLeadRequestSync: false,
    allowTransferNotify: false,
};

/**
 * FlowSettings из сырого ответа `/app-settings/event-sales` — те же
 * выражения, что у бэкового use-case:
 * - `withTaskChecklist` — `Boolean(settings.withTaskChecklist)`; настроек
 *   нет — false (бэковый isTaskChecklistEnabled: «отчёт важнее чек-листа»);
 * - `fieldPolicySettings` — Boolean-коэрция `withCalculatedNextEvent` /
 *   `withFinalFieldsReset` (бэковый resolveFieldPolicySettings); настроек
 *   нет ЛИБО ключей в записи нет (кэш прошлой схемы) — undefined, и
 *   use-case работает на дефолтах СХЕМЫ (DEFAULT_FIELD_POLICY_SETTINGS) —
 *   ровно бэковая ветка «настройки недоступны»;
 * - `leadUfDefinitions` не собираются: они нужны только lead-request-sync,
 *   а он при дефолтной карте прав всегда уходит досылкой.
 */
export const buildDirectFlowSettings = (
    raw: PortalAppSettings | null,
): FlowSettings => {
    const fieldPolicySettings: EventFieldPolicySettings | undefined =
        raw &&
        (raw.withCalculatedNextEvent !== undefined ||
            raw.withFinalFieldsReset !== undefined)
            ? {
                  calculatedNextEvent: Boolean(raw.withCalculatedNextEvent),
                  resetOnFinal: Boolean(raw.withFinalFieldsReset),
              }
            : undefined;

    return {
        withTaskChecklist: raw ? Boolean(raw.withTaskChecklist) : false,
        fieldPolicySettings,
        capabilities: { ...DIRECT_CAPABILITY_DEFAULTS },
    };
};

/**
 * FlowSettings по слепку настроек из swr-кэша (та самая запись, которой
 * живёт AppConfigThunk). Кэша нет или запись битая — безопасные дефолты,
 * как у бэка при упавшем сервисе настроек; прямой путь это не остановит.
 */
export const loadDirectFlowSettings = async (
    domain: string,
): Promise<FlowSettings> => {
    try {
        const entry = await readSwrCache<PortalAppSettings>(
            getAppConfigCacheKey(domain),
        );
        const raw =
            entry && isAppSettingsPayload(entry.value) ? entry.value : null;

        return buildDirectFlowSettings(raw);
    } catch (error) {
        console.warn(
            '[event-outbox] настройки приложения не прочитались — прямой путь на дефолтах',
            error,
        );

        return buildDirectFlowSettings(null);
    }
};
