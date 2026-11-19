import { describe, expect, it } from 'vitest';
import { appLayoutKind, isReportChainAllowed } from '../app-layout-kind';

describe('appLayoutKind — каркас страницы по адресу', () => {
    it('публичные: снимок отчёта и страницы разбора звонка (обычная и личная)', () => {
        expect(appLayoutKind('/share/abc')).toBe('public');
        expect(appLayoutKind('/call/abc')).toBe('public');
        expect(appLayoutKind('/call/abc/lead/x.y')).toBe('public');
    });

    it('«Разборы звонков» — приложение без обвязки отчёта', () => {
        expect(appLayoutKind('/calls')).toBe('bare');
        expect(appLayoutKind('/calls/')).toBe('bare');
    });

    it('остальное — отчёт; похожие адреса не путаются', () => {
        expect(appLayoutKind('/report')).toBe('report');
        expect(appLayoutKind('/report/user')).toBe('report');
        expect(appLayoutKind('/callsx')).toBe('report');
        expect(appLayoutKind('/')).toBe('report');
        expect(appLayoutKind(null)).toBe('report');
    });
});

describe('isReportChainAllowed — запускать ли цепочку загрузки отчёта', () => {
    it('на страницах отчёта — да', () => {
        expect(isReportChainAllowed(appLayoutKind('/report'))).toBe(true);
        expect(isReportChainAllowed(appLayoutKind('/report/user'))).toBe(true);
    });

    it('на «Разборах звонков» и публичных страницах — нет', () => {
        expect(isReportChainAllowed(appLayoutKind('/calls'))).toBe(false);
        expect(isReportChainAllowed(appLayoutKind('/call/abc'))).toBe(false);
    });
});
