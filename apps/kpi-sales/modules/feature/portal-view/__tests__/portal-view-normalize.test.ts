import { describe, expect, it } from 'vitest';
import {
    normalizePortalViewResponse,
    safeSupportUrl,
} from '../lib/portal-view-normalize';

const FULL = {
    view: {
        tabsHidden: ['digest', 'finance'],
        chartsEnabled: false,
        badgesMain: ['b1', 'm1'],
        updatedBy: 'Иванов Иван',
        updatedAt: '2026-11-20T09:30:00.000Z',
    },
    canEdit: true,
    supportUrl: 'https://t.me/support',
    options: {
        tabs: [
            { code: 'events', name: 'События' },
            { code: 'call_reviews', name: 'Разборы звонков' },
        ],
        badges: [
            {
                id: 'b1',
                title: 'Презентация',
                hint: 'Была ли презентация',
                group: 'general',
                callTypes: [],
                mainByDefault: true,
            },
            {
                id: 'm1',
                title: 'Выявил потребность',
                hint: null,
                group: 'methodology',
                callTypes: ['presentation', 'refine'],
                mainByDefault: false,
            },
        ],
        methodology: { code: 'polyansky', title: 'Полянский' },
    },
};

describe('normalizePortalViewResponse — полный ответ', () => {
    it('корректный ответ проходит как есть', () => {
        expect(normalizePortalViewResponse(FULL)).toEqual(FULL);
    });
});

describe('normalizePortalViewResponse — значения по умолчанию', () => {
    const defaults = {
        view: {
            tabsHidden: [],
            chartsEnabled: true,
            badgesMain: [],
            updatedBy: null,
            updatedAt: null,
        },
        canEdit: false,
        supportUrl: null,
        options: { tabs: [], badges: [], methodology: null },
    };

    it.each([
        ['undefined', undefined],
        ['null', null],
        ['строка', 'ok'],
        ['массив', []],
        ['пустой объект', {}],
    ])('%s → безопасные значения', (_name, raw) => {
        expect(normalizePortalViewResponse(raw)).toEqual(defaults);
    });

    it('нет view — ничего не скрыто, графики включены, набор бейджей по умолчанию', () => {
        const result = normalizePortalViewResponse({ canEdit: true });
        expect(result.view).toEqual(defaults.view);
        expect(result.canEdit).toBe(true);
    });

    it('нет options — пустые справочники, методики нет', () => {
        const result = normalizePortalViewResponse({ view: FULL.view });
        expect(result.options).toEqual(defaults.options);
        expect(result.view.chartsEnabled).toBe(false);
    });

    it('нет отдельных полей view — они заменяются значениями по умолчанию', () => {
        const result = normalizePortalViewResponse({ view: { tabsHidden: ['ai'] } });
        expect(result.view).toEqual({ ...defaults.view, tabsHidden: ['ai'] });
    });

    it('chartsEnabled не булево — графики включены', () => {
        const result = normalizePortalViewResponse({ view: { chartsEnabled: 'no' } });
        expect(result.view.chartsEnabled).toBe(true);
    });

    it('chartsEnabled=false сохраняется', () => {
        const result = normalizePortalViewResponse({ view: { chartsEnabled: false } });
        expect(result.view.chartsEnabled).toBe(false);
    });

    it('не-строки в списках отбрасываются', () => {
        const result = normalizePortalViewResponse({
            view: { tabsHidden: ['ai', 7, null, '', 'digest'], badgesMain: 'x' },
        });
        expect(result.view.tabsHidden).toEqual(['ai', 'digest']);
        expect(result.view.badgesMain).toEqual([]);
    });

    it('canEdit — только настоящее true', () => {
        expect(normalizePortalViewResponse({ canEdit: 'true' }).canEdit).toBe(false);
        expect(normalizePortalViewResponse({ canEdit: 1 }).canEdit).toBe(false);
        expect(normalizePortalViewResponse({ canEdit: true }).canEdit).toBe(true);
    });

    it('пустые «кто» и «когда» — null', () => {
        const result = normalizePortalViewResponse({
            view: { updatedBy: '  ', updatedAt: '' },
        });
        expect(result.view.updatedBy).toBeNull();
        expect(result.view.updatedAt).toBeNull();
    });
});

describe('normalizePortalViewResponse — справочники', () => {
    it('вкладки без кода или названия отбрасываются', () => {
        const result = normalizePortalViewResponse({
            options: {
                tabs: [
                    { code: 'events', name: 'События' },
                    { code: 'ai' },
                    { name: 'Без кода' },
                    'мусор',
                ],
            },
        });
        expect(result.options.tabs).toEqual([{ code: 'events', name: 'События' }]);
    });

    it('бейдж без id или названия отбрасывается, остальное добирается значениями по умолчанию', () => {
        const result = normalizePortalViewResponse({
            options: {
                badges: [
                    { id: 'a', title: 'Без группы' },
                    { id: 'b' },
                    { title: 'Без id' },
                ],
            },
        });
        expect(result.options.badges).toEqual([
            {
                id: 'a',
                title: 'Без группы',
                hint: null,
                group: 'general',
                callTypes: [],
                mainByDefault: false,
            },
        ]);
    });

    it('неизвестная группа — «общие»; mainByDefault только настоящее true', () => {
        const result = normalizePortalViewResponse({
            options: {
                badges: [
                    { id: 'a', title: 'A', group: 'other', mainByDefault: 'yes' },
                    { id: 'b', title: 'B', group: 'methodology', mainByDefault: true },
                ],
            },
        });
        expect(result.options.badges.map(badge => badge.group)).toEqual([
            'general',
            'methodology',
        ]);
        expect(result.options.badges.map(badge => badge.mainByDefault)).toEqual([
            false,
            true,
        ]);
    });

    it('методика без названия — null', () => {
        const result = normalizePortalViewResponse({
            options: { methodology: { code: 'x' } },
        });
        expect(result.options.methodology).toBeNull();
    });
});

describe('safeSupportUrl — ссылка поддержки уходит в href', () => {
    it('https и http проходят', () => {
        expect(safeSupportUrl('https://t.me/support')).toBe('https://t.me/support');
        expect(safeSupportUrl('http://example.org/chat')).toBe('http://example.org/chat');
    });

    it.each([
        'javascript:alert(1)',
        'data:text/html,<b>x</b>',
        'tg://resolve?domain=support',
        'просто текст',
        '/relative/path',
        '',
        '   ',
    ])('%s → null', value => {
        expect(safeSupportUrl(value)).toBeNull();
    });

    it('не строка → null', () => {
        expect(safeSupportUrl(null)).toBeNull();
        expect(safeSupportUrl(undefined)).toBeNull();
        expect(safeSupportUrl(42)).toBeNull();
    });
});
