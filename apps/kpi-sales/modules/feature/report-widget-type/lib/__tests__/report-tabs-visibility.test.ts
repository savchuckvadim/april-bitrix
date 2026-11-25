import { describe, expect, it } from 'vitest';
import { EReportType } from '../../consts/report-type.consts';
import {
    REPORT_TYPE_TAB_CODES,
    fallbackReportType,
    isReportTypeHidden,
    reportTypeTabCode,
    withoutHiddenReportTypes,
} from '../report-tabs-visibility';

const ALL_TYPES = Object.values(EReportType);

describe('reportTypeTabCode — код вкладки для портальных настроек', () => {
    it('у «Все» код «all» — её тоже можно скрыть', () => {
        expect(reportTypeTabCode(EReportType.All)).toBe('all');
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

    it('«Все» скрывается своим кодом и только им', () => {
        expect(isReportTypeHidden(EReportType.All, ['all', 'ai'])).toBe(true);
        expect(isReportTypeHidden(EReportType.All, ['events', 'ai'])).toBe(false);
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

    it('«Все» скрыта — ряд начинается со следующей вкладки', () => {
        expect(withoutHiddenReportTypes(ALL_TYPES, ['all'])).toEqual(
            ALL_TYPES.filter(type => type !== EReportType.All),
        );
    });

    it('скрыто всё доступное — остаётся первая доступная вкладка, ряд не пустеет', () => {
        const everything = Object.values(REPORT_TYPE_TAB_CODES);
        expect(withoutHiddenReportTypes(ALL_TYPES, everything)).toEqual([EReportType.All]);
        expect(
            withoutHiddenReportTypes([EReportType.MERGED, EReportType.AI], everything),
        ).toEqual([EReportType.MERGED]);
    });

    it('пустой список типов остаётся пустым', () => {
        expect(withoutHiddenReportTypes([], ['all'])).toEqual([]);
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

describe('fallbackReportType — куда уйти с недоступной вкладки', () => {
    it('первая из доступных', () => {
        expect(fallbackReportType([EReportType.EVENTS, EReportType.MERGED])).toBe(
            EReportType.EVENTS,
        );
        expect(fallbackReportType(ALL_TYPES)).toBe(EReportType.All);
    });

    it('доступных нет — null', () => {
        expect(fallbackReportType([])).toBeNull();
    });
});
