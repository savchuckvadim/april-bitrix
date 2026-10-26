import { describe, expect, it } from 'vitest';
import { formatDelta, formatLogTime, levelTone, toLogsParams } from './logs-view';

describe('logs-view', () => {
    it('параметры запроса без пустых полей и без «все»', () => {
        expect(
            toLogsParams({
                hours: 24,
                app: 'all',
                level: 'error',
                domain: ' gsr.bitrix24.ru ',
                search: '',
            }),
        ).toEqual({ hours: 24, level: 'error', domain: 'gsr.bitrix24.ru' });
    });

    it('цвет уровня', () => {
        expect(levelTone('error')).toBe('destructive');
        expect(levelTone('warn')).toBe('warning');
        expect(levelTone('debug')).toBe('muted');
    });

    it('сравнение с прошлым окном', () => {
        expect(formatDelta(30, 10)).toBe('+20');
        expect(formatDelta(3, 6)).toBe('−3');
        expect(formatDelta(5, 5)).toBe('=');
    });

    it('время: не дата — как есть, пусто — прочерк', () => {
        expect(formatLogTime(null)).toBe('—');
        expect(formatLogTime('не дата')).toBe('не дата');
        expect(formatLogTime('2026-10-26T15:04:05.123000Z')).toMatch(/26\.10/);
    });
});
