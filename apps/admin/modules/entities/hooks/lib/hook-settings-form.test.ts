import { describe, expect, it } from 'vitest';
import type {
    PortalAppSettingDescriptor,
    PortalAppSettingsResponse,
} from '@/modules/entities/portal/app-settings/model';
import type { HookSettingRef } from '../model';
import { buildHookSettingsForm } from './hook-settings-form';

/** Значение настройки: в контракте описано шире, чем приезжает. */
type SettingValue = PortalAppSettingDescriptor['default'];

const descriptor = (code: string): PortalAppSettingDescriptor => ({
    code,
    name: code,
    description: '',
    type: 'number',
    default: 1 as unknown as SettingValue,
    stored: false,
    value: null as unknown as SettingValue,
    group: 'g',
});

const ref = (
    code: string,
    app = 'event-sales',
    role: HookSettingRef['role'] = 'param',
): HookSettingRef => ({
    app,
    key: code,
    code,
    name: code,
    type: 'number',
    default: 1,
    role,
    note: `как используется ${code}`,
});

const response: PortalAppSettingsResponse = {
    apps: [
        {
            appCode: 'sales',
            settings: [descriptor('sales_only')],
            groups: [],
        },
        {
            appCode: 'event-sales',
            settings: [
                descriptor('lead_intake_sla_minutes'),
                descriptor('lead_intake_sla_enabled'),
                descriptor('unrelated'),
            ],
            groups: [],
        },
    ],
};

describe('buildHookSettingsForm', () => {
    it('дескрипторы приложения в порядке карточки хука, лишние не попадают', () => {
        const form = buildHookSettingsForm(
            [
                ref('lead_intake_sla_enabled', 'event-sales', 'gate'),
                ref('lead_intake_sla_minutes'),
            ],
            response,
        );

        expect(form.missing).toEqual([]);
        expect(form.groups).toHaveLength(1);
        expect(form.groups[0]?.appCode).toBe('event-sales');
        expect(form.groups[0]?.items.map(item => item.descriptor.code)).toEqual([
            'lead_intake_sla_enabled',
            'lead_intake_sla_minutes',
        ]);
        expect(form.groups[0]?.items[0]?.ref.role).toBe('gate');
    });

    it('настройки другого приложения — своя группа; пустое приложение = event-sales', () => {
        const form = buildHookSettingsForm(
            [ref('lead_intake_sla_minutes', ''), ref('sales_only', 'sales')],
            response,
        );

        expect(form.groups.map(group => group.appCode)).toEqual([
            'event-sales',
            'sales',
        ]);
    });

    it('чего нет в схеме бэка или в неизвестном приложении — в missing', () => {
        const form = buildHookSettingsForm(
            [ref('ghost'), ref('x', 'no-such-app'), ref('lead_intake_sla_minutes')],
            response,
        );

        expect(form.missing.map(item => item.code)).toEqual(['ghost', 'x']);
        expect(form.groups[0]?.items).toHaveLength(1);
    });

    it('без ответа бэка формы нет', () => {
        expect(buildHookSettingsForm([ref('a')], undefined)).toEqual({
            groups: [],
            missing: [],
        });
    });
});
