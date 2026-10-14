import { describe, expect, it } from 'vitest';
import type {
    PortalAppSettingDescriptor,
    PortalAppSettingsBlock,
} from '../model';
import {
    buildGroupViews,
    FALLBACK_GROUP,
    resolveSettingsLink,
} from './settings-view';

/** Значение настройки: в контракте оно описано шире, чем приезжает. */
type SettingValue = PortalAppSettingDescriptor['default'];

/**
 * Категории и поиск в настройках приложений (запрос владельца 13.10.2026:
 * в сотне ключей event-sales не найти нужное).
 */

const setting = (
    code: string,
    name: string,
    group: string,
    stored = false,
): PortalAppSettingDescriptor => ({
    code,
    name,
    description: `Описание ${name}`,
    type: 'boolean',
    default: false as unknown as SettingValue,
    stored,
    value: (stored ? true : null) as unknown as SettingValue,
    group,
});

const block = (
    settings: PortalAppSettingDescriptor[],
    withGroups = true,
): PortalAppSettingsBlock => ({
    appCode: 'event-sales',
    settings,
    groups: withGroups
        ? [
              {
                  code: 'lead_sla',
                  title: 'Заявки: SLA принятия',
                  description: '',
                  links: [],
              },
              {
                  code: 'xo_rescue',
                  title: 'Подстраховка ХО',
                  description: '',
                  links: [
                      {
                          title: 'Поля компании',
                          href: '/portal/{portalId}/pbx/company',
                      },
                  ],
              },
          ]
        : [],
});

const SETTINGS = [
    setting('xo_rescue_enabled', 'Подстраховка ХО: включена', 'xo_rescue', true),
    setting('lead_intake_sla_minutes', 'SLA: минут на принятие', 'lead_sla'),
    setting('xo_rescue_max_per_run', 'Подстраховка ХО: лимит', 'xo_rescue'),
];

describe('buildGroupViews', () => {
    it('без поиска — секции в порядке бэка, счётчик «настроено»', () => {
        const views = buildGroupViews(block(SETTINGS), '');
        expect(views.map(view => view.group.code)).toEqual([
            'lead_sla',
            'xo_rescue',
        ]);
        expect(views[1]).toMatchObject({ customized: 1, total: 2 });
    });

    it('поиск по коду находит настройку и оставляет только её секцию', () => {
        const views = buildGroupViews(block(SETTINGS), '  MAX_PER_RUN ');
        expect(views).toHaveLength(1);
        expect(views[0]!.settings.map(item => item.code)).toEqual([
            'xo_rescue_max_per_run',
        ]);
        // Счётчик — по всей секции, а не по найденному.
        expect(views[0]).toMatchObject({ customized: 1, total: 2 });
    });

    it('поиск по названию категории показывает всю категорию', () => {
        const views = buildGroupViews(block(SETTINGS), 'подстраховка');
        expect(views.map(view => view.settings.length)).toEqual([2]);
    });

    it('ничего не нашлось — пусто', () => {
        expect(buildGroupViews(block(SETTINGS), 'нет такого')).toEqual([]);
    });

    it('старый бэк без категорий — одна секция «Все настройки»', () => {
        const legacy = SETTINGS.map(({ group: _group, ...rest }) => ({
            ...rest,
            group: '',
        }));
        const views = buildGroupViews(block(legacy, false), '');
        expect(views).toHaveLength(1);
        expect(views[0]!.group).toBe(FALLBACK_GROUP);
        expect(views[0]!.settings).toHaveLength(3);
    });
});

describe('resolveSettingsLink', () => {
    it('подставляет id портала', () => {
        expect(resolveSettingsLink('/portal/{portalId}/pbx/company', 7)).toBe(
            '/portal/7/pbx/company',
        );
    });
});
