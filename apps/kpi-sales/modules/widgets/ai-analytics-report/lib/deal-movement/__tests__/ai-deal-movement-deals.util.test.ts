import { describe, expect, it } from 'vitest';
import {
    AI_DM_ALL_MANAGERS,
    AI_DM_DEALS_FILTER_DEFAULT,
    aiDmDealsQuery,
    aiDmDealsTitles,
    aiDmHasDealsFilter,
    aiDmLimitedNote,
    aiDmManagerOptions,
    aiDmPerGroupText,
    aiDmStatusOptions,
    aiDmWithManager,
    aiDmWithPage,
    aiDmWithPageSize,
    aiDmWithStatuses,
} from '../ai-deal-movement-deals.util';
import { cell, departmentCells } from './ai-deal-movement.fixtures';

const nameOf = (id: string | null): string => (id ? `Имя ${id}` : 'Ответственный не назначен');

describe('ai-deal-movement-deals — фильтр списка', () => {
    const page3 = { ...AI_DM_DEALS_FILTER_DEFAULT, page: 3 };

    it('смена менеджера и статусов возвращает на первую страницу', () => {
        expect(aiDmWithManager(page3, '447')).toMatchObject({ managerId: '447', page: 1 });
        expect(aiDmWithManager(page3, AI_DM_ALL_MANAGERS).managerId).toBeNull();
        expect(aiDmWithManager(page3, null).managerId).toBeNull();
        expect(aiDmWithStatuses(page3, ['stuck', 'moving', 'nope'])).toMatchObject({
            statuses: ['stuck'],
            page: 1,
        });
        expect(aiDmWithPageSize(page3, 50)).toMatchObject({ pageSize: 50, page: 1 });
    });

    it('страница — целая и не меньше первой', () => {
        expect(aiDmWithPage(AI_DM_DEALS_FILTER_DEFAULT, 0).page).toBe(1);
        expect(aiDmWithPage(AI_DM_DEALS_FILTER_DEFAULT, 2.7).page).toBe(2);
    });

    it('«Сбросить фильтры» — только когда что-то выбрано', () => {
        expect(aiDmHasDealsFilter(AI_DM_DEALS_FILTER_DEFAULT)).toBe(false);
        expect(aiDmHasDealsFilter(page3)).toBe(false);
        expect(aiDmHasDealsFilter({ ...page3, managerId: '1' })).toBe(true);
        expect(aiDmHasDealsFilter({ ...page3, statuses: ['stuck'] })).toBe(true);
    });

    it('тело запроса: выбранный менеджер, иначе менеджеры фильтра отчёта, иначе все', () => {
        expect(aiDmDealsQuery(AI_DM_DEALS_FILTER_DEFAULT, [])).toEqual({
            page: 1,
            pageSize: 25,
        });
        expect(aiDmDealsQuery(AI_DM_DEALS_FILTER_DEFAULT, ['1', '2'])).toEqual({
            managerIds: ['1', '2'],
            page: 1,
            pageSize: 25,
        });
        expect(
            aiDmDealsQuery(
                { ...AI_DM_DEALS_FILTER_DEFAULT, managerId: '447', statuses: ['abandoned'], page: 2 },
                ['1', '2'],
            ),
        ).toEqual({ managerIds: ['447'], statuses: ['abandoned'], page: 2, pageSize: 25 });
    });
});

describe('ai-deal-movement-deals — варианты фильтров и подписи', () => {
    it('менеджеры: «все» первым, выбранный вне списка добавляется', () => {
        expect(aiDmManagerOptions(['1'], null, nameOf)).toEqual([
            { value: AI_DM_ALL_MANAGERS, label: 'Все менеджеры' },
            { value: '1', label: 'Имя 1' },
        ]);
        expect(aiDmManagerOptions(['1'], '9', nameOf).map(item => item.value)).toEqual([
            AI_DM_ALL_MANAGERS,
            '1',
            '9',
        ]);
    });

    it('статусы: подпись сервера и число сделок', () => {
        expect(aiDmStatusOptions(departmentCells())[0]).toEqual({
            value: 'rolled_back',
            label: 'Вернулась назад',
            hint: '2',
        });
    });

    it('подписи статусов: из обзора, недостающие — из строк списка', () => {
        const titles = aiDmDealsTitles([cell('stuck', 1)], [
            { status: 'abandoned', statusTitle: 'Без внимания' },
            { status: 'stuck', statusTitle: 'другая подпись' },
        ]);
        expect(titles.get('stuck')).toBe('Без продвижения');
        expect(titles.get('abandoned')).toBe('Без внимания');
    });

    it('«показаны 30 из 48» — только по неполным группам, лишние — числом', () => {
        const titles = aiDmDealsTitles(departmentCells(), []);
        const note = aiDmLimitedNote(
            [
                { managerId: '447', status: 'abandoned', total: 48, shown: 30 },
                { managerId: '512', status: 'stuck', total: 5, shown: 5 },
                { managerId: null, status: 'at_risk', total: 31, shown: 30 },
                { managerId: '600', status: 'stuck', total: 40, shown: 30 },
            ],
            nameOf,
            titles,
            2,
        );
        expect(note.lines).toEqual([
            'Имя 447 · Без внимания — показаны 30 из 48',
            'Ответственный не назначен · Под риском — показаны 30 из 31',
        ]);
        expect(note.rest).toBe(1);
        expect(aiDmLimitedNote([], nameOf, titles)).toEqual({ lines: [], rest: 0 });
    });

    it('без подписи статуса — только имя', () => {
        const note = aiDmLimitedNote(
            [{ managerId: '1', status: 'stuck', total: 2, shown: 1 }],
            nameOf,
            new Map(),
        );
        expect(note.lines).toEqual(['Имя 1 — показаны 1 из 2']);
    });

    it('пояснение предела списка', () => {
        expect(aiDmPerGroupText(30)).toContain('не больше 30');
    });
});
