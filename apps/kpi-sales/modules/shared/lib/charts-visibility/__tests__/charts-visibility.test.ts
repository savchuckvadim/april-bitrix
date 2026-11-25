import { describe, expect, it } from 'vitest';
import { chartsVisible, effectiveChartView } from '../charts-visibility';

describe('chartsVisible', () => {
    it('настройка включена, не телефон — графики видны', () => {
        expect(chartsVisible(true, false)).toBe(true);
    });

    it('настройка включена, телефон — графики скрыты', () => {
        expect(chartsVisible(true, true)).toBe(false);
    });

    it('настройка выключена, не телефон — графики скрыты', () => {
        expect(chartsVisible(false, false)).toBe(false);
    });

    it('настройка выключена, телефон — графики скрыты', () => {
        expect(chartsVisible(false, true)).toBe(false);
    });
});

describe('effectiveChartView', () => {
    it('графики видны — остаётся выбранный вид', () => {
        expect(effectiveChartView<'chart' | 'table'>('chart', 'table', true)).toBe('chart');
        expect(effectiveChartView<'chart' | 'table'>('table', 'table', true)).toBe('table');
    });

    it('графики скрыты — всегда табличный вид', () => {
        expect(effectiveChartView<'chart' | 'table'>('chart', 'table', false)).toBe('table');
        expect(effectiveChartView<'chart' | 'table'>('table', 'table', false)).toBe('table');
    });

    it('работает с любым набором видов', () => {
        type View = 'bars' | 'list' | 'lines';
        expect(effectiveChartView<View>('lines', 'list', false)).toBe('list');
        expect(effectiveChartView<View>('lines', 'list', true)).toBe('lines');
    });
});
