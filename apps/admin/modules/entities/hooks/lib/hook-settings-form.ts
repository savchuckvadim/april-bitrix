import {
    PORTAL_APP_CODE,
    type PortalAppCode,
    type PortalAppSettingDescriptor,
    type PortalAppSettingsResponse,
} from '@/modules/entities/portal/app-settings/model';
import type { HookSettingRef } from '../model';

/** Поле формы: ссылка хука на настройку + дескриптор с действующим значением. */
export interface HookSettingsFormItem {
    ref: HookSettingRef;
    descriptor: PortalAppSettingDescriptor;
}

/** Группа формы — приложение настроек: у мутации сохранения один appCode. */
export interface HookSettingsFormGroup {
    appCode: PortalAppCode;
    items: HookSettingsFormItem[];
}

export interface HookSettingsForm {
    groups: HookSettingsFormGroup[];
    /** Настройки хука, которых нет в схеме приложений этого бэка. */
    missing: HookSettingRef[];
}

const APP_CODES = new Set<string>(Object.values(PORTAL_APP_CODE));

const isPortalAppCode = (value: string): value is PortalAppCode =>
    APP_CODES.has(value);

/**
 * Поля формы настроек хука на портале: дескрипторы приложений портала (с их
 * действующими значениями) отбираются по `settings[].code` карточки хука в
 * порядке карточки. Приложение берётся из `ref.app` (обычно event-sales);
 * пустое — event-sales. Настройка, которой нет в схеме этого бэка или чьё
 * приложение бэк не отдал, попадает в `missing`: показать, но не править.
 */
export const buildHookSettingsForm = (
    refs: readonly HookSettingRef[],
    response: PortalAppSettingsResponse | undefined,
): HookSettingsForm => {
    const groups = new Map<PortalAppCode, HookSettingsFormGroup>();
    const missing: HookSettingRef[] = [];
    if (!response) return { groups: [], missing };

    for (const ref of refs) {
        const app = ref.app || PORTAL_APP_CODE['event-sales'];
        const block = isPortalAppCode(app)
            ? response.apps.find(item => item.appCode === app)
            : undefined;
        const descriptor = block?.settings.find(item => item.code === ref.code);
        if (!block || !descriptor) {
            missing.push(ref);
            continue;
        }
        let group = groups.get(block.appCode);
        if (!group) {
            group = { appCode: block.appCode, items: [] };
            groups.set(block.appCode, group);
        }
        group.items.push({ ref, descriptor });
    }

    return { groups: [...groups.values()], missing };
};
