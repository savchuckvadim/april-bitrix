import { describe, expect, it } from 'vitest';
import {
    attentionItem,
    dossier,
    managerRow,
    managerTrends,
    metric,
    planFact,
    planFactRow,
    styleCard,
    yoy,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import { AI_LEVEL } from '@/modules/entities/ai-analytics/lib/ai-overview.data';
import {
    aiEmployeeBucketExtremes,
    aiEmployeePlanFactRows,
    aiEmployeeSlogan,
    buildAiEmployeeBrief,
} from '../ai-employee-brief.util';

const tile = (brief: ReturnType<typeof buildAiEmployeeBrief>, key: string) => {
    const found = brief.tiles.find(item => item.key === key);
    if (!found) throw new Error(`нет плитки ${key}`);
    return found;
};

describe('aiEmployeeSlogan — резюме-строка из фактов', () => {
    it('сигнал, сильная и слабая корзины — одной строкой, без эпитетов', () => {
        const row = managerRow({ signal: attentionItem({ signal: 'weak_presentation' }) });
        const slogan = aiEmployeeSlogan(row);
        expect(slogan).toMatch(/^Главный сигнал — /);
        expect(slogan).toContain('сильная сторона — презентация (6,4 из 10)');
        expect(slogan).toContain('слабое место — контакт (5,5 из 10)');
        expect(slogan.endsWith('.')).toBe(true);
    });

    it('без сигнала — «сигналов нет» впереди; без оценок — честная причина; без строки — пусто', () => {
        expect(aiEmployeeSlogan(managerRow())).toMatch(/^Сигналов нет; сильная сторона/);
        const bare = managerRow({
            buckets: [{ bucket: 'closing', n: 3, score: metric(null, 3) }],
            analyzedCalls: 3,
        });
        expect(aiEmployeeSlogan(bare)).toBe(
            'Разобрано 3 звонков за период — для резюме данных пока мало.',
        );
        expect(aiEmployeeSlogan(null)).toContain('собрать не из чего');
    });

    it('крайние корзины: одна оценённая — только сильная; корзины без оценки не считаются', () => {
        const one = aiEmployeeBucketExtremes([
            { bucket: 'contact', n: 10, score: metric(6, 10) },
            { bucket: 'closing', n: 3, score: metric(null, 3) },
        ]);
        expect(one.strong?.bucket).toBe('contact');
        expect(one.weak).toBeNull();
        expect(aiEmployeeBucketExtremes([])).toEqual({ strong: null, weak: null });
    });
});

describe('buildAiEmployeeBrief — плитки «Коротко»', () => {
    it('оценка и разобрано из строки; уровень и цель из план-факта; движение к цели со статусом и прогнозом', () => {
        const brief = buildAiEmployeeBrief({
            managerId: '7',
            row: managerRow({ trends: managerTrends(), yoy: yoy() }),
            dossier: null,
            planFact: planFact(),
            style: styleCard(),
        });
        expect(tile(brief, 'score').value).toBe('6,1');
        expect(tile(brief, 'score').note).toBe('разобрано 25 из 60');
        expect(tile(brief, 'level').value).toBe(AI_LEVEL.middle.label);
        expect(tile(brief, 'level').note).toBe('цель месяца: 10 продаж');
        expect(tile(brief, 'progress').value).toBe('3 из 10 продаж');
        expect(tile(brief, 'progress').note).toContain('отстаёт');
        expect(tile(brief, 'progress').note).toContain('прогноз на конец месяца: 6');
        expect(tile(brief, 'trends').value).not.toBe('');
        expect(tile(brief, 'yoy').value).toMatch(/^год назад/);
    });

    it('без строки обзора — оценка из последнего месяца досье, уровень из паспорта, запасные тексты', () => {
        const brief = buildAiEmployeeBrief({
            managerId: '7',
            row: null,
            dossier: dossier(),
            planFact: null,
            style: null,
        });
        expect(tile(brief, 'score').value).toBe('6,4');
        expect(tile(brief, 'score').note).toContain('последнего месяца');
        expect(tile(brief, 'level').value).toBe(AI_LEVEL.middle.label);
        expect(tile(brief, 'level').note).toBe('цель месяца не задана');
        expect(tile(brief, 'progress').note).toBe('план и факт месяца ещё не посчитаны');
        expect(tile(brief, 'style').value).toBe('профиль стиля ещё не собран');
        expect(tile(brief, 'trends').value).toContain('трендов пока нет');
        expect(tile(brief, 'yoy').value).toContain('истории за тот же месяц год назад нет');
    });

    it('план-факт без цели — факт без плана; строки берутся из досье, если ручки за месяц нет', () => {
        const fromDossier = aiEmployeePlanFactRows(
            null,
            dossier({
                planFact: planFact({
                    rows: [{ managerId: '7', rows: [planFactRow({ plan: null, status: 'no-plan', fact: 2 })] }],
                }),
            }),
            '7',
        );
        expect(fromDossier).toHaveLength(1);
        const brief = buildAiEmployeeBrief({
            managerId: '7',
            row: managerRow(),
            dossier: dossier({
                planFact: planFact({
                    rows: [{ managerId: '7', rows: [planFactRow({ plan: null, status: 'no-plan', fact: 2 })] }],
                }),
            }),
            planFact: null,
            style: null,
        });
        expect(tile(brief, 'progress').value).toBe('продаж за месяц: 2');
        expect(tile(brief, 'progress').note).toBe('плана на месяц нет');
        expect(aiEmployeePlanFactRows(null, null, '7')).toEqual([]);
    });

    it('стиль одной фразой: заметная особенность карточки, иначе первая подпись', () => {
        const withNotable = buildAiEmployeeBrief({
            managerId: '7',
            row: null,
            dossier: null,
            planFact: null,
            style: styleCard({ notable: ['Быстро переходит к цене'] }),
        });
        expect(tile(withNotable, 'style').value).toBe('Быстро переходит к цене');
    });
});
