import { describe, expect, it } from 'vitest';
import { AI_BUCKETS } from '@/modules/entities/ai-analytics/lib/ai-overview.data';
import { AI_CALL_SECTION_CODES } from '@/modules/entities/ai-analytics/lib/ai-call-sections.data';
import { AI_MATRIX_BLOCK_TEXT } from '../ai-matrix-texts';
import { aiMatrixLegend } from '../ai-matrix-legend.util';
import { aiMatrixEmptyView } from '../ai-matrix-empty.util';

/* Правило владельца: по-русски, без кодов, формул, стрелок, «админки» и «периметра». */
const FORBIDDEN = /[→×≥≤σκβ↑↓]|n ?=|админк|значимо|рычаг|вилк|в тени|периметр|мало данных/i;

const flatten = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [];
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === 'object') {
        return Object.values(value).flatMap(flatten);
    }
    return [];
};

const T = AI_MATRIX_BLOCK_TEXT;

describe('AI_MATRIX_BLOCK_TEXT — словарь блоков-матриц', () => {
    it('легенда: одна строка через точки, хвост с датой и порогом только когда они известны', () => {
        expect(T.legend.text('2026-09-25', 300)).toBe(
            'Крупно — средняя оценка AI из 10 · мелко — сколько звонков разобрано · цвет — выше/ниже среднего по отделу · «ещё N» — до оценки не хватает разборов · считаются звонки с 25.09 длиннее 300 сек',
        );
        expect(T.legend.text(null, null)).not.toContain('считаются звонки');
        expect(T.legend.text('2026-09-25', null)).toContain('считаются звонки с 25.09');
        expect(T.legend.text(null, 300)).toContain('считаются звонки длиннее 300 сек');
    });

    it('подсказка легенды: пороги из параметров, дата сравнимости словами, «что сделать»', () => {
        const legend = aiMatrixLegend({ comparableFrom: '2026-09-25', minDurationSec: 300 });
        const text = legend.hint.lines.join(' ');
        expect(legend.hint.title).toBe('Как читать таблицу');
        expect(text).toContain('появляется от 8 разборов, надёжна от 20');
        expect(text).toContain('длиннее 300 сек, сделанные с 25.09.2026');
        expect(text).toContain('Что сделать');
        expect(aiMatrixLegend({ comparableFrom: null, minDurationSec: null }).hint.lines.join(' ')).not.toContain('сделанные с');
    });

    it('подсказки корзин и разделов есть для каждого кода', () => {
        for (const bucket of AI_BUCKETS) {
            expect(T.types.bucketHint[bucket].length).toBeGreaterThan(0);
        }
        for (const code of AI_CALL_SECTION_CODES) {
            expect(T.sections.sectionDescription[code].length).toBeGreaterThan(0);
        }
        expect(T.sections.sectionHint('Работа по цене', 'описание', 72)).toBe(
            'Работа по цене: описание. Для этого вида звонка раздел важен на 72 %. Оценивается только в звонках, где раздел был уместен. Слабый раздел — тема для разбора с сотрудником.',
        );
        expect(T.sections.sectionHint('Раздел', 'описание', null)).not.toContain('важен');
        expect(T.types.typeHint('Презентация')).toContain('Нажмите на заголовок');
    });

    it('пустые состояния: причина и действие', () => {
        const names = (id: string) => (id === '7' ? 'Софья Шумихина' : id);
        const pilot = aiMatrixEmptyView(
            { kind: 'pilot-outside-filter', pilotIds: ['7'] },
            names,
        );
        expect(pilot.text).toBe(
            'Разбор звонков пока включён только для: Софья Шумихина. В фильтре отчёта этих сотрудников нет.',
        );
        expect(pilot.note).toContain('попросите разработчика');
        expect(pilot.action).toEqual({
            kind: 'add-to-filter',
            label: 'Добавить в фильтр',
            managerIds: ['7'],
        });

        const before = aiMatrixEmptyView(
            { kind: 'before-comparable', count: 14, comparableFrom: '2026-09-25', canShowFrom: true },
            names,
        );
        expect(before.text).toContain('За период разобрано 14 звонков, но по прежней версии разбора');
        expect(before.text).toContain('Сравнимые разборы идут с 25.09.2026');
        expect(before.action).toEqual({ kind: 'show-from', label: 'Показать с 25.09', date: '2026-09-25' });
        expect(
            aiMatrixEmptyView(
                { kind: 'before-comparable', count: 1, comparableFrom: '2026-09-25', canShowFrom: false },
                names,
            ),
        ).toMatchObject({ action: null, note: 'Что сделать: выберите период после этой даты.' });

        expect(aiMatrixEmptyView({ kind: 'disabled' }, names).text).toContain('попросите разработчика');
        expect(aiMatrixEmptyView({ kind: 'before-analysis', since: '2026-10-01' }, names).text).toContain(
            'идёт с 01.10.2026',
        );
        expect(aiMatrixEmptyView({ kind: 'short', count: 5, minDurationSec: 300 }, names).text).toContain('(300 сек)');
        expect(aiMatrixEmptyView({ kind: 'none', minDurationSec: 300 }, names).text).toBe(
            'За период звонков длиннее 300 сек у сотрудников в разборе не было. Что сделать: выберите другой период или проверьте, что сотрудники из разбора выбраны в фильтре.',
        );
        expect(aiMatrixEmptyView({ kind: 'none', minDurationSec: null }, names).text).not.toContain('длиннее');
    });

    it('графики и рейтинги: «Больше всего разборов», «Средняя оценка … (взвешено по числу звонков)», подпись о предварительности', () => {
        expect(T.rating.mostReviews('отделы')).toBe('Больше всего разборов — отделы');
        expect(T.rating.avgScore('отделы')).toBe('Средняя оценка — отделы (взвешено по числу звонков)');
        expect(T.rating.preliminary).toBe('Порядок предварительный — мало разборов, чтобы сравнивать людей');
        expect(T.chart.title('Софья Шумихина', T.chart.columns.types)).toBe(
            'Оценки по типам звонков: Софья Шумихина и среднее по отделу',
        );
        expect(T.chart.title(null, T.chart.columns.buckets)).toBe('Оценки по корзинам звонков: среднее по отделу');
        expect(T.chart.tooltip('Презентация', 6.4, 18, false)).toBe('Презентация: 6,4 из 10 по 18 звонкам');
        expect(T.chart.tooltip('Презентация', 6.4, 11, true)).toContain('· предварительно');
        expect(T.hidden.label(7)).toBe('Без разборов за период: 7 сотрудников');
        expect(T.hidden.label(1)).toBe('Без разборов за период: 1 сотрудник');
    });

    it('все тексты блока — по-русски, без стрелок, формул, «админки» и «мало данных»', () => {
        const texts = [
            ...flatten(T),
            T.legend.text('2026-09-25', 300),
            ...aiMatrixLegend({ comparableFrom: '2026-09-25', minDurationSec: 300 }).hint.lines,
            T.sections.sectionHint('Раздел', 'описание', 72),
            T.types.typeHint('Презентация'),
            T.empty.beforeAnalysis('2026-10-01'),
            T.empty.pilotOutside('Имя'),
            T.empty.beforeComparable(14, '2026-09-25'),
            T.empty.short(300),
            T.empty.noType(2),
            T.empty.none(300),
            T.chart.empty(8),
        ];
        expect(texts.length).toBeGreaterThan(40);
        for (const text of texts) expect(text).not.toMatch(FORBIDDEN);
    });
});
