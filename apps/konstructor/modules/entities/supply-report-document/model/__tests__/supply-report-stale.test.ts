import { describe, expect, it } from 'vitest';
import { supplyReportActions, supplyReportReducer, type SupplyReportState } from '../SupplyReportSlice';

/** Смена режима вариантов: готовый отчёт и ошибка прежней проверки устарели. */

const initial = supplyReportReducer(undefined, { type: '@@init' });
const run = (state: SupplyReportState, ...actions: Parameters<typeof supplyReportReducer>[1][]): SupplyReportState =>
    actions.reduce(supplyReportReducer, state);

describe('смена режима вариантов: результат отчёта о поставке', () => {
    it('готовый отчёт сбрасывается, заявка RPA остаётся известной', () => {
        const state = run(
            initial,
            supplyReportActions.generateDone({ link: 'https://report', rpaId: 55 }),
            supplyReportActions.generateStale(),
        );
        expect(state.generate).toEqual({ status: 'idle', error: null, link: null, rpaId: null });
        expect(state.rpaId).toBe(55);
    });

    it('ошибка прежней проверки (участник не собирается) снимается', () => {
        const state = run(
            initial,
            supplyReportActions.generateFailed('Вариант «Юристу» нельзя включить в документ'),
            supplyReportActions.generateStale(),
        );
        expect(state.generate.status).toBe('idle');
        expect(state.generate.error).toBeNull();
    });

    it('идущее формирование не трогается', () => {
        const state = run(initial, supplyReportActions.generateStarted(), supplyReportActions.generateStale());
        expect(state.generate.status).toBe('generating');
    });

    it('значения формы, файлы и контакты остаются', () => {
        const state = run(
            initial,
            supplyReportActions.setNeedProcess(false),
            supplyReportActions.generateDone({ link: 'https://report', rpaId: null }),
            supplyReportActions.generateStale(),
        );
        expect(state.needProcess).toBe(false);
    });
});
