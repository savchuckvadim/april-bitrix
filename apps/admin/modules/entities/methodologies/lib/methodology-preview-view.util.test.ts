import { describe, expect, it } from 'vitest';
import type {
    MethodologyPreviewResult,
    PreviewCheckpoint,
} from '../model/methodology-preview';
import { clock, toMethodologyPreviewView } from './methodology-preview-view.util';

/** toLocaleString('ru-RU') ставит неразрывные пробелы — в тестах обычные. */
const plain = (text: string): string => text.replace(/\s/g, ' ');

const CALL_TYPES = [{ code: 'cold', title: 'Холодный звонок' }];
const SECTIONS = [{ code: 'NEEDS', title: 'Выявление потребностей' }];

const checkpoint = (fields: Partial<PreviewCheckpoint> = {}): PreviewCheckpoint => ({
    code: 'cold.benefit',
    title: 'Назвал выгоду для клиента',
    status: 'done',
    mandatory: true,
    source: 'model',
    quote: 'Это сэкономит вам час в день.',
    startSec: 74,
    endSec: 81,
    ...fields,
});

const result = (
    fields: Partial<MethodologyPreviewResult> = {},
): MethodologyPreviewResult => ({
    callType: 'cold',
    applicable: true,
    methodology: {
        code: 'draft-own',
        version: '1.0.0',
        title: 'Черновик',
        checkpoints: [checkpoint()],
        checkpointsDone: 1,
        checkpointsTotal: 1,
        spirals: null,
        spiralsFull: null,
        spiralsMinFull: null,
    },
    capsTriggered: [],
    scoreBefore: 6,
    scoreAfter: 6,
    model: 'bitrix/bitrixgpt-5.5',
    tokens: 14200,
    ...fields,
});

const view = (fields: Partial<MethodologyPreviewResult> = {}) =>
    toMethodologyPreviewView(result(fields), CALL_TYPES, SECTIONS);

describe('toMethodologyPreviewView', () => {
    it('время в звонке — мм:сс', () => {
        expect(clock(74)).toBe('01:14');
        expect(clock(5)).toBe('00:05');
        expect(clock(3605.4)).toBe('60:05');
    });

    it('выполненный пункт: статус, цитата со временем; тип звонка названием, оценка не меняется', () => {
        const preview = view();

        expect(preview.applicable).toBe(true);
        expect(preview.summary).toEqual([
            'Тип звонка: Холодный звонок',
            'Обязательных пунктов выполнено: 1 из 1',
            'Итоговая оценка не меняется: 6',
        ]);
        expect(preview.checkpoints[0]).toEqual({
            code: 'cold.benefit',
            title: 'Назвал выгоду для клиента',
            statusLabel: 'выполнен',
            tone: 'success',
            notes: [],
            quote: '01:14 — «Это сэкономит вам час в день.»',
        });
        expect(plain(preview.usage ?? '')).toBe(
            'Ответила модель bitrix/bitrixgpt-5.5, токенов 14 200.',
        );
    });

    it('пропущенный необязательный пункт по правилу кода: пометки и без цитаты', () => {
        const preview = view({
            methodology: {
                ...(result().methodology as NonNullable<
                    MethodologyPreviewResult['methodology']
                >),
                checkpoints: [
                    checkpoint({
                        status: 'missed',
                        mandatory: false,
                        source: 'rule',
                        quote: null,
                        startSec: null,
                        endSec: null,
                    }),
                    checkpoint({
                        code: 'cold.other',
                        status: 'not_applicable',
                        quote: 'без времени',
                        startSec: null,
                    }),
                ],
                checkpointsDone: 0,
                checkpointsTotal: 0,
            },
        });

        expect(preview.checkpoints[0]).toMatchObject({
            statusLabel: 'пропущен',
            tone: 'warning',
            notes: ['необязательный', 'посчитан по фактам разбора'],
            quote: null,
        });
        expect(preview.checkpoints[1]).toMatchObject({
            statusLabel: 'неприменим',
            tone: 'muted',
            quote: '«без времени»',
        });
    });

    it('ограничители и смена оценки: цель названа словами, спирали с минимумом', () => {
        const preview = view({
            scoreBefore: 8,
            scoreAfter: 5,
            methodology: {
                ...(result().methodology as NonNullable<
                    MethodologyPreviewResult['methodology']
                >),
                spirals: [],
                spiralsFull: 1,
                spiralsMinFull: 3,
            },
            capsTriggered: [
                {
                    code: 'cap.no_benefit',
                    title: 'выгода не названа',
                    target: 'total',
                    max: 5,
                    before: 8,
                    after: 5,
                    applied: true,
                },
                {
                    code: 'cap.needs',
                    title: 'потребности не уточнены',
                    target: 'NEEDS',
                    max: 6,
                    before: 4,
                    after: 4,
                    applied: false,
                },
            ],
        });

        expect(preview.summary).toContain(
            'Полных витков спирали: 1, по методике нужно не меньше 3',
        );
        expect(preview.summary).toContain(
            'Итоговая оценка: сейчас 8, с этой методикой 5',
        );
        expect(preview.caps).toEqual([
            'выгода не названа — итоговая оценка: 8 → 5',
            'потребности не уточнены — Выявление потребностей: условие выполнено, оценка и так не выше 6',
        ]);
    });

    it('методика не применима к типу звонка — только тип, без пунктов и расхода', () => {
        const preview = view({ applicable: false, methodology: null, model: null, tokens: null });

        expect(preview).toEqual({
            applicable: false,
            summary: ['Тип звонка: Холодный звонок'],
            checkpoints: [],
            caps: [],
            usage: null,
        });
    });
});
