import { describe, expect, it } from 'vitest';
import { EReportType } from '../../consts/report-type.consts';
import {
    REPORT_TYPE_TAB_CODES,
    isReportTypeHidden,
    reportTypeTabCode,
    withoutHiddenReportTypes,
} from '../report-tabs-visibility';

const ALL_TYPES = Object.values(EReportType);

describe('reportTypeTabCode — код вкладки для портальных настроек', () => {
    it('у «Все» кода нет — вкладка видна всегда', () => {
        expect(reportTypeTabCode(EReportType.All)).toBeNull();
    });

    it('у остальных типов код совпадает с контрактом бэка', () => {
        expect(reportTypeTabCode(EReportType.EVENTS)).toBe('events');
        expect(reportTypeTabCode(EReportType.CALLINGS)).toBe('callings');
        expect(reportTypeTabCode(EReportType.MERGED)).toBe('merged');
        expect(reportTypeTabCode(EReportType.DIGEST)).toBe('digest');
        expect(reportTypeTabCode(EReportType.FINANCE)).toBe('finance');
        expect(reportTypeTabCode(EReportType.AI)).toBe('ai');
    });

    it('коды разных типов не повторяются', () => {
        const codes = Object.values(REPORT_TYPE_TAB_CODES);
        expect(new Set(codes).size).toBe(codes.length);
    });
});

describe('isReportTypeHidden', () => {
    it('тип со скрытым кодом скрыт', () => {
        expect(isReportTypeHidden(EReportType.FINANCE, ['finance'])).toBe(true);
    });

    it('тип без кода в списке виден', () => {
        expect(isReportTypeHidden(EReportType.FINANCE, ['ai'])).toBe(false);
        expect(isReportTypeHidden(EReportType.AI, [])).toBe(false);
    });

    it('«Все» не скрывается ни при каких кодах', () => {
        expect(isReportTypeHidden(EReportType.All, ['all', 'events', 'ai'])).toBe(false);
    });

    it('«Разборы звонков» в списке не прячут тип отчёта', () => {
        expect(isReportTypeHidden(EReportType.AI, ['call_reviews'])).toBe(false);
    });
});

describe('withoutHiddenReportTypes', () => {
    it('ничего не скрыто — ряд как был', () => {
        expect(withoutHiddenReportTypes(ALL_TYPES, [])).toEqual(ALL_TYPES);
    });

    it('скрытые убираются, порядок остальных сохраняется', () => {
        const result = withoutHiddenReportTypes(ALL_TYPES, ['digest', 'finance']);
        expect(result).toEqual(
            ALL_TYPES.filter(
                type => type !== EReportType.DIGEST && type !== EReportType.FINANCE,
            ),
        );
    });

    it('даже если скрыто всё, «Все» остаётся', () => {
        const everything = Object.values(REPORT_TYPE_TAB_CODES);
        expect(withoutHiddenReportTypes(ALL_TYPES, everything)).toEqual([EReportType.All]);
    });

    it('неизвестные коды игнорируются', () => {
        expect(withoutHiddenReportTypes(ALL_TYPES, ['unknown'])).toEqual(ALL_TYPES);
    });

    it('исходный массив не меняется', () => {
        const source = [...ALL_TYPES];
        withoutHiddenReportTypes(source, ['ai']);
        expect(source).toEqual(ALL_TYPES);
    });
});
