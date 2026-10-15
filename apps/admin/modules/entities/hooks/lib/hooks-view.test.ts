import { describe, expect, it } from 'vitest';
import type {
    HookCatalogItem,
    HookFieldCheck,
    HookPbxFieldRef,
    HookSettingCheck,
    HookSettingRef,
    HookStageCheck,
    HookStageRef,
    PortalHookReadiness,
} from '../model';
import {
    buildHookHref,
    buildHooksCatalogHref,
    filterHookItems,
    formatMissingRequired,
    formatSettingValue,
    groupHooksByFamily,
    indexReadinessByCode,
    mergeHookFields,
    mergeHookSettings,
    mergeHookStages,
    parsePortalIdParam,
    resolveEnabledBadge,
    resolveHookLink,
    resolveReadinessBadge,
    sortHookFieldRows,
    summarizeHookEffects,
    toPortalSelectOptions,
} from './hooks-view';

describe('summarizeHookEffects', () => {
    it('пишет: writes, связи и метки; читает: reads и маршрутизация; рубильники отдельно', () => {
        const effects = summarizeHookEffects({
            pbxFields: [
                { entity: 'deal', code: 'link', name: 'Связь', type: 'crm', role: 'link', required: true, note: null },
                { entity: 'lead', code: 'mark', name: 'Метка', type: 'datetime', role: 'marker', required: true, note: null },
                { entity: 'lead', code: 'route', name: 'Отдел', type: 'string', role: 'routing', required: false, note: null },
                { entity: 'lead', code: 'read', name: 'Телефоны', type: 'string', role: 'reads', required: false, note: null },
                { entity: 'company', code: 'w', name: 'Поле', type: 'string', role: 'writes', required: false, note: null },
            ],
            stages: [{ entity: 'lead', code: 'lead_assigned', title: 'Назначена', required: true, note: null }],
            settings: [
                { app: 'event-sales', key: 'g', code: 'g_code', name: 'Рубильник', type: 'boolean', default: false, role: 'gate', note: 'вкл' },
                { app: 'event-sales', key: 'p', code: 'p_code', name: 'Параметр', type: 'number', default: 1, role: 'param', note: 'п' },
            ],
        });

        expect(effects.writes.map(group => group.entity)).toEqual(['lead', 'deal', 'company']);
        expect(effects.writes[0]?.fields.map(field => field.code)).toEqual(['mark']);
        expect(effects.reads).toEqual([
            expect.objectContaining({ entity: 'lead' }),
        ]);
        expect(effects.reads[0]?.fields.map(field => field.code)).toEqual(['route', 'read']);
        expect(effects.stages.map(stage => stage.code)).toEqual(['lead_assigned']);
        expect(effects.gates.map(gate => gate.code)).toEqual(['g_code']);
    });
});

describe('sortHookFieldRows', () => {
    it('группирует поля по сущностям от лида к задаче, сохраняя порядок карточки внутри', () => {
        const rows = [
            { entity: 'deal' as const, code: 'd1' },
            { entity: 'lead' as const, code: 'l1' },
            { entity: 'company' as const, code: 'c1' },
            { entity: 'deal' as const, code: 'd2' },
            { entity: 'lead' as const, code: 'l2' },
        ];

        expect(sortHookFieldRows(rows).map(row => row.code)).toEqual([
            'l1',
            'l2',
            'd1',
            'd2',
            'c1',
        ]);
        // Исходный массив не меняется.
        expect(rows[0]?.code).toBe('d1');
    });
});

const item = (
    code: string,
    family: HookCatalogItem['family'],
    extra: Partial<HookCatalogItem> = {},
): HookCatalogItem => ({
    code,
    title: `Хук ${code}`,
    family,
    familyTitle: `Семейство ${family}`,
    kind: 'webhook',
    summary: `Описание ${code}`,
    cron: null,
    hasOperations: false,
    requiredFieldsCount: 0,
    requiredStagesCount: 0,
    settingsCount: 0,
    ...extra,
});

describe('groupHooksByFamily: семейства в порядке показа', () => {
    it('порядок семейств фиксирован, внутри — порядок бэка, пустые не показываются', () => {
        const groups = groupHooksByFamily([
            item('cron-a', 'cron'),
            item('lead-to-work', 'sales-hook'),
            item('lead-accept', 'lead-request'),
            item('lead-client', 'sales-hook'),
        ]);

        expect(groups.map(group => group.family)).toEqual([
            'sales-hook',
            'lead-request',
            'cron',
        ]);
        expect(groups[0]?.title).toBe('Хуки отдела продаж (sales-hooks)');
        expect(groups[0]?.items.map(hook => hook.code)).toEqual([
            'lead-to-work',
            'lead-client',
        ]);
    });

    it('неизвестное семейство уходит в конец с названием из ответа', () => {
        const groups = groupHooksByFamily([
            {
                ...item('x', 'cron'),
                family: 'new-family' as HookCatalogItem['family'],
                familyTitle: 'Новое семейство',
            },
            item('y', 'cold-hook'),
        ]);

        expect(groups.map(group => group.title)).toEqual([
            'Холодный обзвон (cold-hook)',
            'Новое семейство',
        ]);
    });

    it('пустой каталог — пусто', () => {
        expect(groupHooksByFamily([])).toEqual([]);
    });
});

describe('filterHookItems: поиск по названию, описанию и коду', () => {
    const items = [
        item('lead-to-work', 'sales-hook', { title: 'Лид → работа' }),
        item('duplicate-check', 'sales-hook', { summary: 'Ищет дубли' }),
    ];

    it('пустой запрос оставляет всё, регистр и пробелы не важны', () => {
        expect(filterHookItems(items, '')).toHaveLength(2);
        expect(filterHookItems(items, '  ЛИД ')).toHaveLength(1);
        expect(filterHookItems(items, 'дубли').map(hook => hook.code)).toEqual([
            'duplicate-check',
        ]);
        expect(filterHookItems(items, 'to-work').map(hook => hook.code)).toEqual([
            'lead-to-work',
        ]);
        expect(filterHookItems(items, 'нет такого')).toEqual([]);
    });
});

describe('бэйджи готовности', () => {
    it('статусы установки', () => {
        expect(resolveReadinessBadge('ready')).toEqual({
            label: 'Готов',
            tone: 'success',
        });
        expect(resolveReadinessBadge('partial')).toEqual({
            label: 'Частично',
            tone: 'warning',
        });
        expect(resolveReadinessBadge('not-installed')).toEqual({
            label: 'Не установлен',
            tone: 'destructive',
        });
        expect(resolveReadinessBadge('none').label).toBe('Без требований');
        expect(resolveReadinessBadge('unknown').label).toBe('Без требований');
        expect(resolveReadinessBadge(undefined).label).toBe('Без требований');
    });

    it('рубильник: true/false/null, undefined — бэйджа нет', () => {
        expect(resolveEnabledBadge(true)?.label).toBe('Включён');
        expect(resolveEnabledBadge(false)?.label).toBe('Выключен');
        expect(resolveEnabledBadge(null)).toEqual({ label: '—', tone: 'muted' });
        expect(resolveEnabledBadge(undefined)).toBeNull();
    });
});

describe('resolveHookLink', () => {
    it('подставляет id портала во все вхождения', () => {
        expect(resolveHookLink('/portal/{portalId}/pbx/lead', 7)).toBe(
            '/portal/7/pbx/lead',
        );
        expect(resolveHookLink('/p/{portalId}/x/{portalId}', 42)).toBe(
            '/p/42/x/42',
        );
        expect(resolveHookLink('/hooks', 7)).toBe('/hooks');
    });
});

describe('formatMissingRequired', () => {
    it('первые три через запятую, остаток — «и ещё N»', () => {
        expect(formatMissingRequired([])).toBe('');
        expect(formatMissingRequired(['a', 'b'])).toBe('a, b');
        expect(formatMissingRequired(['a', 'b', 'c', 'd', 'e'])).toBe(
            'a, b, c и ещё 2',
        );
        expect(formatMissingRequired(['a', 'b'], 1)).toBe('a и ещё 1');
    });
});

describe('parsePortalIdParam', () => {
    it('только положительное целое', () => {
        expect(parsePortalIdParam('7')).toBe(7);
        expect(parsePortalIdParam('0')).toBeUndefined();
        expect(parsePortalIdParam('-1')).toBeUndefined();
        expect(parsePortalIdParam('7a')).toBeUndefined();
        expect(parsePortalIdParam('')).toBeUndefined();
        expect(parsePortalIdParam(null)).toBeUndefined();
        expect(parsePortalIdParam(undefined)).toBeUndefined();
    });
});

describe('адреса раздела', () => {
    it('карточка хука: портальный и глобальный режимы', () => {
        expect(buildHookHref('lead-to-work', 7, true)).toBe(
            '/portal/7/hooks/lead-to-work',
        );
        expect(buildHookHref('lead-to-work', 7, false)).toBe(
            '/hooks/lead-to-work?portalId=7',
        );
        expect(buildHookHref('lead-to-work', undefined, false)).toBe(
            '/hooks/lead-to-work',
        );
        // Фиксированный режим без id портала невозможен — остаётся глобальный.
        expect(buildHookHref('a b', undefined, true)).toBe('/hooks/a%20b');
    });

    it('каталог', () => {
        expect(buildHooksCatalogHref(7, true)).toBe('/portal/7/hooks');
        expect(buildHooksCatalogHref(7, false)).toBe('/hooks?portalId=7');
        expect(buildHooksCatalogHref(undefined, false)).toBe('/hooks');
    });
});

describe('toPortalSelectOptions', () => {
    it('по домену, id строкой', () => {
        expect(
            toPortalSelectOptions([
                { id: 2, domain: 'b.bitrix24.ru' },
                { id: 1, domain: 'a.bitrix24.ru' },
            ]),
        ).toEqual([
            { value: '1', label: 'a.bitrix24.ru (#1)' },
            { value: '2', label: 'b.bitrix24.ru (#2)' },
        ]);
        expect(toPortalSelectOptions(undefined)).toEqual([]);
    });

    it('без домена — «Портал #id»', () => {
        expect(toPortalSelectOptions([{ id: 3 }])).toEqual([
            { value: '3', label: 'Портал #3' },
        ]);
    });
});

describe('слияние карточки с готовностью портала', () => {
    const readiness = (
        hooks: Partial<PortalHookReadiness>[],
    ): PortalHookReadiness[] =>
        hooks.map(hook => ({
            code: 'x',
            title: 'x',
            family: 'sales-hook',
            status: 'ready',
            enabled: null,
            missingRequired: [],
            fields: [],
            stages: [],
            settings: [],
            ...hook,
        }));

    it('indexReadinessByCode: карта по коду, без ответа — пустая', () => {
        const map = indexReadinessByCode({
            portalId: 7,
            domain: 'a',
            hooks: readiness([{ code: 'a' }, { code: 'b', status: 'partial' }]),
        });
        expect(map.get('b')?.status).toBe('partial');
        expect(indexReadinessByCode(undefined).size).toBe(0);
    });

    const settingRef: HookSettingRef = {
        app: 'event-sales',
        key: 'leadIntakeSlaMinutes',
        code: 'lead_intake_sla_minutes',
        name: 'SLA',
        type: 'number',
        default: 60,
        role: 'param',
        note: 'порог',
    };
    const settingCheck: HookSettingCheck = {
        ...settingRef,
        value: 90,
        stored: true,
        href: '/portal/{portalId}/app-settings',
    };

    it('настройки: значение и признак с портала, без портала — null', () => {
        expect(mergeHookSettings([settingRef], [settingCheck])[0]).toMatchObject({
            value: 90,
            stored: true,
            href: '/portal/{portalId}/app-settings',
        });
        expect(mergeHookSettings([settingRef], undefined)[0]).toMatchObject({
            value: null,
            stored: null,
            href: null,
        });
        // Ключ совпадения — приложение + ключ схемы.
        expect(
            mergeHookSettings([settingRef], [{ ...settingCheck, app: 'sales' }])[0]
                ?.stored,
        ).toBeNull();
    });

    it('поля и стадии: installed/mapped по сущности и коду', () => {
        const field: HookPbxFieldRef = {
            entity: 'lead',
            code: 'to_base_sales',
            name: 'Корневая сделка',
            type: 'crm',
            role: 'link',
            required: true,
            note: null,
        };
        const fieldCheck: HookFieldCheck = {
            ...field,
            installed: true,
            href: '/portal/{portalId}/pbx/lead',
        };
        expect(mergeHookFields([field], [fieldCheck])[0]).toMatchObject({
            installed: true,
            href: '/portal/{portalId}/pbx/lead',
        });
        expect(
            mergeHookFields([field], [{ ...fieldCheck, entity: 'deal' }])[0]
                ?.installed,
        ).toBeNull();

        const stage: HookStageRef = {
            entity: 'lead',
            code: 'lead_assigned',
            title: 'Назначена менеджеру',
            required: true,
            note: null,
        };
        const stageCheck: HookStageCheck = {
            ...stage,
            mapped: false,
            href: '/portal/{portalId}/pbx/lead',
        };
        expect(mergeHookStages([stage], [stageCheck])[0]?.mapped).toBe(false);
        expect(mergeHookStages([stage], undefined)[0]?.mapped).toBeNull();
    });
});

describe('formatSettingValue', () => {
    it('булево словами, пусто — тире, остальное строкой', () => {
        expect(formatSettingValue(true)).toBe('вкл');
        expect(formatSettingValue(false)).toBe('выкл');
        expect(formatSettingValue(60)).toBe('60');
        expect(formatSettingValue('a,b')).toBe('a,b');
        expect(formatSettingValue('')).toBe('—');
        expect(formatSettingValue(null)).toBe('—');
        expect(formatSettingValue(undefined)).toBe('—');
    });
});
