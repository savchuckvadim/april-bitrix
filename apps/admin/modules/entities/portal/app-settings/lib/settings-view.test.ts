import { describe, expect, it } from 'vitest';
import type {
    PortalAppSettingDescriptor,
    PortalAppSettingsBlock,
} from '../model';
import {
    buildGroupViews,
    FALLBACK_GROUP,
    groupAnchorId,
    groupRequirementsByEntity,
    isGroupAnchored,
    resolveSettingsLink,
    settingAnchorId,
} from './settings-view';

describe('resolveSettingsLink: глобальные ссылки', () => {
    it('ссылка без плейсхолдера портала остаётся как есть', () => {
        expect(resolveSettingsLink('/ai-analytics/guide#enable-and-push', 7)).toBe(
            '/ai-analytics/guide#enable-and-push',
        );
        expect(resolveSettingsLink('/portal/{portalId}/ai-settings?tab=knowledge', 7)).toBe(
            '/portal/7/ai-settings?tab=knowledge',
        );
    });
});

describe('isGroupAnchored', () => {
    it('раскрывает секцию по якорю категории или её настройки, иначе нет', () => {
        expect(groupAnchorId('ai_analytics_main')).toBe('group-ai_analytics_main');
        expect(settingAnchorId('ai_analytics_enabled')).toBe('setting-ai_analytics_enabled');
        expect(isGroupAnchored('#group-ai_analytics_main', 'ai_analytics_main', [])).toBe(true);
        expect(
            isGroupAnchored('#setting-ai_analytics_enabled', 'ai_analytics_main', [
                'ai_analytics_enabled',
            ]),
        ).toBe(true);
        expect(
            isGroupAnchored('#setting-ai_analytics_enabled', 'ai_analytics_people', [
                'ai_analytics_levels',
            ]),
        ).toBe(false);
        expect(isGroupAnchored('', 'ai_analytics_main', ['ai_analytics_enabled'])).toBe(false);
    });
});

describe('groupRequirementsByEntity', () => {
    it('поля и стадии — по сущностям от лида к задаче, обязательные первыми', () => {
        const result = groupRequirementsByEntity(
            [
                { entity: 'deal', code: 'd_opt', name: 'Д1', href: '/d' },
                { entity: 'lead', code: 'l_opt', name: 'Л1', required: false, href: '/l' },
                { entity: 'lead', code: 'l_req', name: 'Л2', required: true, href: '/l' },
                { entity: 'company', code: 'c', name: 'К', required: true, href: '/c' },
            ],
            [
                { entity: 'deal', code: 'sales_new', title: 'Новая', required: true, href: '/d' },
                { entity: 'lead', code: 'lead_assigned', title: 'Назначена', href: '/l' },
            ],
        );

        expect(result.map(item => item.entity)).toEqual(['lead', 'deal', 'company']);
        expect(result[0]?.fields.map(field => field.code)).toEqual(['l_req', 'l_opt']);
        expect(result[0]?.stages.map(stage => stage.code)).toEqual(['lead_assigned']);
        expect(result[1]?.stages.map(stage => stage.code)).toEqual(['sales_new']);
    });

    it('без требований — пусто', () => {
        expect(groupRequirementsByEntity()).toEqual([]);
    });
});

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
