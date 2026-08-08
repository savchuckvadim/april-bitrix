import { describe, expect, it } from 'vitest';
import {
    buildStageDict,
    dealStageEntityId,
    mapBoundDeal,
    type StageDictItem,
} from './bound-deal-view';

const STAGES: StageDictItem[] = [
    { statusId: 'NEW', name: 'Новая' },
    { statusId: 'PREPARATION', name: 'Презентация' },
    { statusId: 'EXECUTING', name: 'В решении' },
    { statusId: 'WON', name: 'Успех' },
];

describe('buildStageDict', () => {
    it('вырезает стадии-провалы, успех оставляет финалом шкалы', () => {
        const dict = buildStageDict([
            { STATUS_ID: 'WON', NAME: 'Продажа', SORT: 40, SEMANTICS: 'S' },
            { STATUS_ID: 'NEW', NAME: 'Новая', SORT: 10 },
            {
                STATUS_ID: 'LOSE',
                NAME: 'Отказ',
                SORT: 50,
                SEMANTICS: 'F',
            },
            {
                STATUS_ID: 'APOLOGY',
                NAME: 'Не состоялась',
                SORT: 60,
                EXTRA: { SEMANTICS: 'apology' },
            },
            { STATUS_ID: 'PREP', NAME: 'Презентация', SORT: 20 },
        ]);
        expect(dict.map(item => item.statusId)).toEqual([
            'NEW',
            'PREP',
            'WON',
        ]);
    });

    it('несёт портальный цвет стадии (COLOR или EXTRA.COLOR, с #)', () => {
        const dict = buildStageDict([
            { STATUS_ID: 'NEW', NAME: 'Новая', SORT: 10, COLOR: '#232323' },
            {
                STATUS_ID: 'PREP',
                NAME: 'Презентация',
                SORT: 20,
                EXTRA: { COLOR: 'FFD800' },
            },
            { STATUS_ID: 'EXEC', NAME: 'В решении', SORT: 30 },
        ]);
        expect(dict.map(item => item.color)).toEqual([
            '#232323',
            '#FFD800',
            undefined,
        ]);
    });
});

describe('dealStageEntityId', () => {
    it('общая воронка — DEAL_STAGE, остальные — с номером', () => {
        expect(dealStageEntityId(0)).toBe('DEAL_STAGE');
        expect(dealStageEntityId(undefined)).toBe('DEAL_STAGE');
        expect(dealStageEntityId('5')).toBe('DEAL_STAGE_5');
    });
});

describe('mapBoundDeal', () => {
    it('считает позицию стадии по словарю воронки', () => {
        const result = mapBoundDeal(
            {
                ID: '25111',
                TITLE: 'Продление сопровождения',
                STAGE_ID: 'PREPARATION',
                OPPORTUNITY: '124000',
                CLOSED: 'N',
                DATE_CREATE: '2026-05-01T10:00:00+03:00',
            },
            STAGES,
        );
        expect(result.id).toBe(25111);
        expect(result.stage.order).toBe(1);
        expect(result.stage.total).toBe(4);
        expect(result.stage.title).toBe('Презентация');
        expect(result.opportunity).toBe(124000);
        expect(result.closed).toBe(false);
    });

    it('стадии нет в словаре — позиция не выдумывается', () => {
        const result = mapBoundDeal(
            { ID: 1, STAGE_ID: 'C5:UNKNOWN' },
            STAGES,
        );
        expect(result.stage.order).toBeUndefined();
        expect(result.stage.total).toBeUndefined();
        expect(result.stage.bitrixId).toBe('C5:UNKNOWN');
    });

    it('без словаря и названия — честные заглушки', () => {
        const result = mapBoundDeal({ ID: '7', CLOSED: 'Y' }, undefined);
        expect(result.title).toBe('Сделка 7');
        expect(result.closed).toBe(true);
        expect(result.opportunity).toBeUndefined();
    });
});
