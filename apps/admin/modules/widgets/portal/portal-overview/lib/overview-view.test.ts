import { describe, expect, it } from 'vitest';
import {
    dialogsOfPortal,
    formatMinutes,
    hookCounts,
    installedPlacementCount,
    isBitrixLimitError,
    launchCounts,
    normalizeDomain,
    widgetRows,
} from './overview-view';

const TITLES = { 'event-sales': 'Звонки (ОП)', konstructor: 'Конструктор КП' };

describe('сводка портала: виджеты', () => {
    const components = [
        { componentType: 'placement', componentCode: 'CRM_DEAL_DETAIL_TAB:event-sales', status: 'installed' },
        { componentType: 'placement', componentCode: 'CRM_LEAD_DETAIL_TAB:event-sales', status: 'installed' },
        {
            componentType: 'placement',
            componentCode: 'CRM_DEAL_DETAIL_TAB:konstructor',
            status: 'error',
            errorDetail: 'PLACEMENT_HANDLER_NOT_FOUND',
        },
        { componentType: 'event', componentCode: 'ONAPPUNINSTALL', status: 'installed' },
    ];

    it('желаемые против синхронизации: установлен с местами, ошибка с причиной, не привязан', () => {
        const rows = widgetRows(['event-sales', 'konstructor', 'report-sales'], components, TITLES);
        expect(rows).toEqual([
            {
                code: 'event-sales',
                title: 'Звонки (ОП)',
                state: 'installed',
                places: ['CRM_DEAL_DETAIL_TAB', 'CRM_LEAD_DETAIL_TAB'],
                detail: null,
            },
            {
                code: 'konstructor',
                title: 'Конструктор КП',
                state: 'error',
                places: [],
                detail: 'PLACEMENT_HANDLER_NOT_FOUND',
            },
            { code: 'report-sales', title: 'report-sales', state: 'missing', places: [], detail: null },
        ]);
    });

    it('считает только привязки виджетов в статусе installed', () => {
        expect(installedPlacementCount(components)).toBe(2);
    });
});

describe('сводка портала: AI и хуки', () => {
    it('блоки запуска AI: готово / сделать / идёт / неизвестно', () => {
        expect(
            launchCounts([{ state: 'done' }, { state: 'todo' }, { state: 'running' }, null, { state: 'x' }]),
        ).toEqual({ done: 1, todo: 1, running: 1, unknown: 2 });
    });

    it('хуки: «без требований» не считаются, выключенные — отдельно', () => {
        expect(
            hookCounts([
                { status: 'ready', enabled: true },
                { status: 'partial', enabled: null },
                { status: 'not-installed', enabled: false },
                { status: 'none', enabled: null },
            ]),
        ).toEqual({ ready: 1, partial: 1, notInstalled: 1, disabled: 1 });
    });
});

describe('сводка портала: поддержка и нагрузка', () => {
    it('обращения именно этого портала, домен сравнивается без протокола и регистра', () => {
        const dialogs = [
            { id: 1, clientPortal: 'https://April-Garant.bitrix24.ru/' },
            { id: 2, clientPortal: 'other.bitrix24.ru' },
            { id: 3, clientPortal: null },
        ];
        expect(dialogsOfPortal(dialogs, 'april-garant.bitrix24.ru').map(d => d.id)).toEqual([1]);
        expect(normalizeDomain(' HTTP://a.ru/x ')).toBe('a.ru');
    });

    it('перегрузка Битрикса узнаётся по коду ошибки', () => {
        expect(isBitrixLimitError('QUERY_LIMIT_EXCEEDED: Too many requests')).toBe(true);
        expect(isBitrixLimitError('OPERATION_TIME_LIMIT')).toBe(true);
        expect(isBitrixLimitError('Cannot read property of undefined')).toBe(false);
    });

    it('минуты — по-человечески', () => {
        expect(formatMinutes(12)).toBe('12 мин');
        expect(formatMinutes(120)).toBe('2 ч');
        expect(formatMinutes(125)).toBe('2 ч 5 мин');
    });
});
