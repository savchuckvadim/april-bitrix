import { describe, expect, it } from 'vitest';
import { AI_EMPLOYEE_TEXT } from '../ai-employee.texts';

/* Правило владельца: по-русски, без кодов, формул, стрелок, «админки» и жаргона. */
const FORBIDDEN = /[→×≥≤σκβ↑↓]|n ?=|админк|значимо|рычаг|вилк|в тени|периметр/i;

const flatten = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [];
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === 'object') {
        return Object.values(value).flatMap(flatten);
    }
    return [];
};

const T = AI_EMPLOYEE_TEXT;

describe('AI_EMPLOYEE_TEXT — словарь AI-раздела страницы сотрудника', () => {
    it('все строки и примеры функций — по-русски, без запрещённых слов', () => {
        const texts = [
            ...flatten(T),
            T.header.period('2026-09-01', '2026-09-30'),
            T.brief.noData(0),
            T.brief.noData(12),
            T.brief.signal('слабая презентация'),
            T.brief.strong('презентация', 7.4),
            T.brief.weak('закрытие', 4.9),
            T.brief.tiles.score.analyzed(25, 60),
            T.brief.tiles.level.target(10),
            T.brief.tiles.progress.factPlan(3, 10),
            T.brief.tiles.progress.forecast(6),
            T.brief.tiles.progress.factOnly(3),
            T.calls.low.description(4),
            T.calls.low.description(null),
            T.calls.low.score(3.5),
            T.feedback.list.description('2026-09-01', '2026-09-30'),
            T.feedback.list.disagreementShare(12.4),
            T.feedback.list.more(3),
            T.feedback.ropMarks.summary(5, 3),
            T.quality.profile.title('корзинам звонков'),
        ];
        expect(texts.length).toBeGreaterThan(60);
        for (const text of texts) expect(text).not.toMatch(FORBIDDEN);
    });

    it('резюме собирается из фактов без оценочных эпитетов, числа — через запятую', () => {
        expect(T.brief.strong('презентация', 7.4)).toBe(
            'сильная сторона — презентация (7,4 из 10)',
        );
        expect(T.brief.weak('закрытие', 4.9)).toBe('слабое место — закрытие (4,9 из 10)');
        expect(T.brief.noData(0)).toContain('резюме собрать не из чего');
        expect(T.brief.noData(5)).toContain('Разобрано 5 звонков');
    });

    it('подсказки плиток — три части: что это, как читать, что сделать (где уместно)', () => {
        for (const tile of Object.values(T.brief.tiles)) {
            expect(tile.hint.title.length).toBeGreaterThan(0);
            expect(tile.hint.lines.length).toBeGreaterThan(0);
        }
        expect(T.brief.tiles.score.hint.lines.join(' ')).toContain('Что сделать');
        expect(T.brief.tiles.progress.hint.lines.join(' ')).toContain('Что сделать');
    });

    it('порог низкой оценки — из ответа, иначе без числа; период — датами', () => {
        expect(T.calls.low.description(4)).toBe(
            'Разобранные звонки с оценкой 4 и ниже за период.',
        );
        expect(T.calls.low.description(3.5)).toContain('3,5 и ниже');
        expect(T.calls.low.description(null)).not.toMatch(/\d/);
        expect(T.header.period('2026-09-01', '2026-09-30')).toContain('01.09–30.09');
        expect(T.feedback.list.disagreementShare(12.4)).toBe(
            'доля несогласий с разбором: 12 %',
        );
    });

    it('прогноз по сотруднику честно назван отдельским, с подсказкой куда смотреть', () => {
        expect(T.target.forecast.note).toContain('по отделу целиком');
        expect(T.target.forecast.note).toContain('личного прогноза по сотруднику нет');
        expect(T.target.forecast.link).toContain('«Сводка»');
    });
});
