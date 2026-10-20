import { describe, expect, it } from 'vitest';
import { AI_BUCKETS } from '@/modules/entities/ai-analytics/lib/ai-overview.data';
import {
    AI_SIGNAL_COLUMN,
    AI_SIGNAL_FINANCE_GROUP,
    AI_SIGNAL_TABLE_TEXT,
} from '../ai-signal-columns.texts';
import { AI_ANALYZED_TEXT, AI_SIGNAL_ROW_BUTTON } from '../ai-signal.texts';
import { AI_TAB_HEADER_TEXT } from '../ai-tab-header.texts';
import {
    AI_READINESS_FLAG_TEXT,
    AI_READINESS_LINE_HINT,
} from '../ai-readiness-banner.texts';
import { AI_OVERVIEW_META_TEXT } from '../ai-overview-meta.texts';
import { AI_PLAN_HEAD_TEXT } from '../ai-plan-head.util';

/* Правило владельца: по-русски, без кодов, формул, стрелок и «админки». */
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

describe('AI_SIGNAL_COLUMN — у каждой колонки подпись и подсказка', () => {
    it('подсказка с заголовком и хотя бы одной строкой; корзины совпадают с ключами колонок', () => {
        for (const [key, column] of Object.entries(AI_SIGNAL_COLUMN)) {
            expect(column.label, key).toMatch(/^[А-ЯЁ]/);
            expect(column.hint.title.length, key).toBeGreaterThan(0);
            expect(column.hint.lines.length, key).toBeGreaterThan(0);
        }
        for (const bucket of AI_BUCKETS) {
            expect(AI_SIGNAL_COLUMN[bucket]).toBeDefined();
        }
    });

    it('финансовые колонки названы как на вкладке «Финансы»; колонки CRM — «сделано / в CRM»', () => {
        expect(AI_SIGNAL_COLUMN.sales.label).toBe('Сделок');
        expect(AI_SIGNAL_COLUMN.advance.label).toBe('Аванс (в кассе)');
        expect(AI_SIGNAL_COLUMN.monthly.label).toBe('Месячная сумма');
        expect(AI_SIGNAL_COLUMN.callsCrm.label).toBe('Звонки: сделано / в CRM');
        expect(AI_SIGNAL_COLUMN.presentationsCrm.label).toBe(
            'Презентации: проведено / в CRM',
        );
        expect(AI_SIGNAL_COLUMN.callsCrm.hint.lines.join(' ')).toContain(
            'самоотчёт менеджера, не план руководителя',
        );
        expect(AI_SIGNAL_COLUMN.planHead.hint.lines.join(' ')).toContain(
            'как в блоке «Планы»',
        );
        expect(AI_SIGNAL_COLUMN.levers.label).toBe('Советы');
    });

    it('шапка финансов: период из ответа и подсказка с «Пересчитать»; без периода — честно', () => {
        expect(AI_SIGNAL_FINANCE_GROUP.label('2026-04-27', '2026-07-26')).toBe(
            'Как на вкладке «Финансы» за 27.04–26.07',
        );
        const hint = AI_SIGNAL_FINANCE_GROUP.hint('2026-04-27', '2026-07-26');
        expect(hint.lines[0]).toContain('за 27.04–26.07');
        expect(hint.lines.join(' ')).toContain('нажмите «Пересчитать»');
        expect(AI_SIGNAL_FINANCE_GROUP.hint(null, null).lines[0]).toContain(
            'в этом сохранённом ответе не указан',
        );
        expect(AI_SIGNAL_TABLE_TEXT.fullAmount('69 024 ₽')).toBe(
            'Полная сумма: 69 024 ₽',
        );
    });

    it('тексты строки: подсказка «разобрано» с датой сравнимости, причины с «что сделать»', () => {
        expect(AI_ANALYZED_TEXT.label(3, 140)).toBe('разобрано 3 из 140');
        expect(AI_ANALYZED_TEXT.noneWithCrm(12)).toBe(
            'AI-разборов нет · в CRM 12 звонков',
        );
        expect(AI_ANALYZED_TEXT.hint('2026-09-25').lines[0]).toContain(
            'с 25.09.2026',
        );
        expect(AI_ANALYZED_TEXT.hint(null).lines[0]).not.toContain('с —');
        expect(AI_ANALYZED_TEXT.reason['before-pipeline']('2026-07-21').lines).toEqual([
            'В этом периоде AI-разбор звонков на портале ещё не шёл: он идёт с 21.07.2026.',
            'Выберите период позже.',
        ]);
        expect(AI_SIGNAL_ROW_BUTTON.style.hint.lines.join(' ')).toContain(
            'не меньше 40',
        );
    });

    it('шапка вкладки: плашка обрезанного периода с точными датами, кнопка «Настройки»', () => {
        const text = AI_TAB_HEADER_TEXT.clamped({
            from: '2026-04-27',
            to: '2026-07-26',
            filterFrom: '2026-01-01',
            filterTo: '2026-07-26',
        });
        expect(text).toContain('AI считает за 27.04–26.07');
        expect(text).toContain('за 01.01–26.07');
        expect(text).toContain('выберите период до 3 месяцев');
        expect(AI_TAB_HEADER_TEXT.settings.label).toBe('Настройки');
        expect(AI_TAB_HEADER_TEXT.refresh.hint.lines.join(' ')).toContain(
            '«Пульс» и «Повестку планёрки»',
        );
        expect(AI_TAB_HEADER_TEXT.recalc.hint.lines.join(' ')).not.toContain(
            'обзор',
        );
    });

    it('плашка готовности: «Утренний разбор менеджерам» вместо «Дайджест»', () => {
        expect(AI_READINESS_FLAG_TEXT.digest.label).toBe(
            'Утренний разбор менеджерам',
        );
        expect(AI_READINESS_FLAG_TEXT.alerts.hint.lines.join(' ')).toContain(
            'в день звонка',
        );
    });

    it('все словари виджета — по-русски, без стрелок, формул и жаргона', () => {
        const texts = [
            ...flatten(AI_SIGNAL_COLUMN),
            ...flatten(AI_SIGNAL_TABLE_TEXT),
            ...flatten(AI_ANALYZED_TEXT),
            ...flatten(AI_SIGNAL_ROW_BUTTON),
            ...flatten(AI_TAB_HEADER_TEXT),
            ...flatten(AI_READINESS_FLAG_TEXT),
            ...flatten(AI_READINESS_LINE_HINT),
            ...flatten(AI_OVERVIEW_META_TEXT),
            ...flatten(AI_PLAN_HEAD_TEXT),
            ...AI_SIGNAL_FINANCE_GROUP.hint(null, null).lines,
            ...AI_OVERVIEW_META_TEXT.analyzed.hint(300, '2026-09-25').lines,
            ...AI_OVERVIEW_META_TEXT.beforeComparable.hint(null).lines,
        ];
        expect(texts.length).toBeGreaterThan(40);
        for (const text of texts) expect(text).not.toMatch(FORBIDDEN);
    });
});
