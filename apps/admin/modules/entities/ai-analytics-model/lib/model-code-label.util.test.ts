import { describe, expect, it } from 'vitest';
import {
    BACKTEST_REASON_LABEL,
    BACKTEST_STATUS_LABEL,
    UNKNOWN_STATUS_LABEL,
} from '../consts/ai-analytics-model.labels.const';
import {
    UNKNOWN_CODE_LABEL,
    codeViewOf,
    reasonViewsOf,
    statusViewOf,
} from './model-code-label.util';

describe('codeViewOf: код → подпись', () => {
    it('известный код получает русскую подпись', () => {
        expect(codeViewOf(BACKTEST_REASON_LABEL, 'coverage-below')).toEqual({
            code: 'coverage-below',
            label: 'Факт попадает в вилку реже цели',
            known: true,
        });
    });

    it('неизвестный код — нейтральная подпись, код сохраняется', () => {
        expect(codeViewOf(BACKTEST_REASON_LABEL, 'new-reason')).toEqual({
            code: 'new-reason',
            label: UNKNOWN_CODE_LABEL,
            known: false,
        });
    });

    it('имена из прототипа объекта не считаются кодами', () => {
        expect(codeViewOf(BACKTEST_REASON_LABEL, 'toString').known).toBe(false);
    });
});

describe('reasonViewsOf: список причин', () => {
    it('повторы убираются, порядок сохраняется, null — пусто', () => {
        expect(
            reasonViewsOf(BACKTEST_REASON_LABEL, [
                'mase-naive',
                'coverage-below',
                'mase-naive',
            ]).map(view => view.code),
        ).toEqual(['mase-naive', 'coverage-below']);
        expect(reasonViewsOf(BACKTEST_REASON_LABEL, null)).toEqual([]);
    });
});

describe('statusViewOf: статус → бэйдж', () => {
    it('известный статус и запасной для неизвестного', () => {
        expect(statusViewOf(BACKTEST_STATUS_LABEL, 'pass').tone).toBe('success');
        expect(statusViewOf(BACKTEST_STATUS_LABEL, 'maybe')).toBe(
            UNKNOWN_STATUS_LABEL,
        );
        expect(statusViewOf(BACKTEST_STATUS_LABEL, 'constructor')).toBe(
            UNKNOWN_STATUS_LABEL,
        );
    });
});
