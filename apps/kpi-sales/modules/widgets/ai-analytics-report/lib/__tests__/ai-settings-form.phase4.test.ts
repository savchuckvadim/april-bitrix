import { describe, expect, it } from 'vitest';
import type { AiSettingsSaveResult } from '@/modules/entities/ai-analytics';
import {
    buildAiSettingsForm,
    type AiSettingsFormState,
    type AiSettingsPrefill,
} from '../ai-settings-form.util';
import {
    AI_SETTINGS_PHASE4_HINT,
    AI_SETTINGS_POOL_CONSENT_TEXT,
    addAiHypothesisRow,
    aiSettingsPhase4State,
    patchAiHypothesisRow,
    removeAiHypothesisRow,
    setAiPool,
} from '../ai-settings-form.phase4';
import {
    aiHypothesisPairs,
    isAiHypothesisInconsistent,
    prefillAiHypothesisRows,
    validateAiHypothesisRows,
} from '../ai-settings-form.hypothesis';
import {
    aiSettingsErrorTabs,
    validateAiSettingsForm,
} from '../ai-settings-form.validate';
import {
    aiSettingsBreakingBlocks,
    applyAiSettingsPayload,
    buildAiSettingsSummary,
    toAiSettingsPayload,
} from '../ai-settings-form.payload';

const TODAY = '2026-09-29';

const RESULT: AiSettingsSaveResult = {
    id: 'audit-1',
    levels: [],
    savedAt: '2026-09-29T10:00:00Z',
    resetCount: 0,
    comparableFrom: '',
    paramsVersion: 'v1',
    breaksSeries: [],
    warnings: [],
};

const prefill = (over: Partial<AiSettingsPrefill> = {}): AiSettingsPrefill => ({
    targets: { byLevel: [], overrides: [] },
    absences: [],
    rosterConfirmedAt: null,
    hypothesis: {
        pairs: [
            { s: 8, n: 20 },
            { s: 5, n: 40 },
        ],
        since: '2026-09-01',
    },
    poolOptIn: false,
    poolConsentAt: null,
    ...over,
});

const form = (over: Partial<AiSettingsPrefill> = {}): AiSettingsFormState =>
    buildAiSettingsForm([], prefill(over));

describe('гипотеза: предзаполнение и разбор', () => {
    it('пары из настроек — по возрастанию оценки; нет гипотезы — две пустые строки', () => {
        expect(form().hypothesis).toEqual([
            { id: 1, s: '5', n: '40' },
            { id: 2, s: '8', n: '20' },
        ]);
        expect(form().nextHypothesisId).toBe(3);
        expect(prefillAiHypothesisRows(null)).toEqual([
            { id: 1, s: '', n: '' },
            { id: 2, s: '', n: '' },
        ]);
        expect(buildAiSettingsForm([]).hypothesis).toHaveLength(2);
    });

    it('в пары уходят только заполненные строки, запятая — десятичный знак', () => {
        expect(
            aiHypothesisPairs([
                { id: 1, s: '9', n: '12,5' },
                { id: 2, s: '', n: '' },
                { id: 3, s: '4', n: '30' },
            ]),
        ).toEqual([
            { s: 4, n: 30 },
            { s: 9, n: 12.5 },
        ]);
    });

    it('проверки: минимум две пары, оценка 3–10, презентаций больше нуля, без повторов', () => {
        const errors = validateAiHypothesisRows([
            { id: 1, s: '2', n: '10' },
            { id: 2, s: '6', n: '0' },
            { id: 3, s: '7', n: '' },
            { id: 4, s: '8', n: '5' },
            { id: 5, s: '8', n: '4' },
            { id: 6, s: '', n: '' },
        ]);
        expect(errors.rows.get(1)).toBe('Оценка от 3 до 10');
        expect(errors.rows.get(2)).toBe('Презентаций больше нуля');
        expect(errors.rows.get(3)).toBe('Укажите число презентаций');
        expect(errors.rows.get(4)).toBe('Такая оценка уже есть');
        expect(errors.rows.has(6)).toBe(false);
        expect(errors.total).toBeNull();
        expect(
            validateAiHypothesisRows([
                { id: 1, s: '5', n: '40' },
                { id: 2, s: '', n: '' },
            ]).total,
        ).toBe('Нужно не меньше 2 пар');
    });

    it('несогласованность: с ростом качества растёт и число презентаций', () => {
        expect(
            isAiHypothesisInconsistent([
                { s: 5, n: 40 },
                { s: 8, n: 20 },
            ]),
        ).toBe(false);
        expect(
            isAiHypothesisInconsistent([
                { s: 8, n: 30 },
                { s: 5, n: 20 },
            ]),
        ).toBe(true);
        expect(isAiHypothesisInconsistent([])).toBe(false);
    });
});

describe('гипотеза: правки, ошибки вкладки, payload', () => {
    it('правки помечают только блок hypothesis; нетронутая гипотеза не проверяется', () => {
        const blank = buildAiSettingsForm([]);
        expect(validateAiSettingsForm(blank, TODAY).hypothesis).toBeNull();
        expect(toAiSettingsPayload(blank, TODAY)).toEqual({});

        const added = addAiHypothesisRow(form());
        expect(added.dirty).toEqual(['hypothesis']);
        expect(added.hypothesis.at(-1)).toEqual({ id: 3, s: '', n: '' });
        expect(added.nextHypothesisId).toBe(4);

        const removed = removeAiHypothesisRow(form(), 1);
        expect(removed.hypothesis.map(row => row.id)).toEqual([2]);
        expect(
            aiSettingsErrorTabs(validateAiSettingsForm(removed, TODAY)),
        ).toEqual(['hypothesis']);
    });

    it('payload — заполненные пары с датой начала; ряд не рвёт; сводка «2 пары»', () => {
        const state = patchAiHypothesisRow(form(), 2, { n: '25' });
        const payload = toAiSettingsPayload(state, TODAY);
        expect(payload).toEqual({
            hypothesis: {
                pairs: [
                    { s: 5, n: 40 },
                    { s: 8, n: 25 },
                ],
                since: TODAY,
            },
        });
        expect(aiSettingsBreakingBlocks(payload)).toEqual([]);
        expect(buildAiSettingsSummary(payload, RESULT).saved).toEqual([
            'Гипотеза качества: 2 пары',
        ]);
        expect(
            applyAiSettingsPayload(prefill(), payload, TODAY).hypothesis,
        ).toEqual(payload.hypothesis);
    });
});

describe('пул порталов: согласие', () => {
    it('дать согласие → блок pool; повтор текущего значения — снимает правку', () => {
        const given = setAiPool(form(), true);
        expect(given.pool).toBe(true);
        expect(given.dirty).toEqual(['pool']);
        expect(toAiSettingsPayload(given, TODAY)).toEqual({
            pool: { optIn: true },
        });

        const same = setAiPool(given, false);
        expect(same.pool).toBeNull();
        expect(same.dirty).toEqual([]);

        const reset = setAiPool(given, null);
        expect(reset.pool).toBeNull();
        expect(toAiSettingsPayload(reset, TODAY)).toEqual({});
    });

    it('отозвать при участии; сводка и настройки после сохранения', () => {
        const current = {
            poolOptIn: true,
            poolConsentAt: '2026-08-01T00:00:00Z',
        };
        const revoked = setAiPool(form(current), false);
        const payload = toAiSettingsPayload(revoked, TODAY);
        expect(payload).toEqual({ pool: { optIn: false } });
        expect(buildAiSettingsSummary(payload, RESULT).saved).toEqual([
            'Пул порталов: согласие отозвано',
        ]);
        const after = applyAiSettingsPayload(prefill(current), payload, TODAY);
        expect(after.poolOptIn).toBe(false);
        expect(after.poolConsentAt).toBeNull();
    });

    it('включение: дата — прежняя, если была, иначе сегодня; предзаполнение из настроек', () => {
        const on = { pool: { optIn: true } };
        expect(applyAiSettingsPayload(prefill(), on, TODAY).poolConsentAt).toBe(
            TODAY,
        );
        expect(
            applyAiSettingsPayload(
                prefill({ poolConsentAt: '2026-08-01' }),
                on,
                TODAY,
            ).poolConsentAt,
        ).toBe('2026-08-01');
        const state = form({ poolOptIn: true, poolConsentAt: '2026-08-01' });
        expect(state.poolOptIn).toBe(true);
        expect(state.poolConsentAt).toBe('2026-08-01');
        expect(state.pool).toBeNull();
        expect(buildAiSettingsForm([]).poolOptIn).toBe(false);
    });
});

describe('вкладки «Гипотеза» и «Пул» со старым сервером', () => {
    it('поля hypothesis нет — «сервер старый», вкладки не правятся; null — гипотезы нет, но править можно', () => {
        expect(aiSettingsPhase4State(null)).toBe('loading');
        expect(aiSettingsPhase4State({})).toBe('outdated');
        expect(aiSettingsPhase4State({ hypothesis: undefined })).toBe(
            'outdated',
        );
        expect(aiSettingsPhase4State({ hypothesis: null })).toBe('ready');
        expect(AI_SETTINGS_PHASE4_HINT.outdated).toContain(
            'попросите разработчика',
        );
        expect(AI_SETTINGS_PHASE4_HINT.ready).toBeNull();
    });
});

describe('текст согласия на пул', () => {
    it('перечисляет всё, что уходит в пул, и ритм — раз в месяц', () => {
        for (const part of [
            'нормы переходов воронки',
            'усадки',
            'срок оплаты',
            'обычный чек и его разброс',
            'сезонность',
            'оценка связи качества',
            'число менеджеров',
            'раз в месяц',
        ]) {
            expect(AI_SETTINGS_POOL_CONSENT_TEXT).toContain(part);
        }
        expect(AI_SETTINGS_POOL_CONSENT_TEXT).not.toContain('квартал');
    });
});
