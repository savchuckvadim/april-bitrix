import { describe, expect, it } from 'vitest';
import type { BXDepartment, BXUser } from '@workspace/bx';
import type { SalesDepartment } from '@/modules/entities/department/model';
import {
    aiPlanShare,
    aiPlanTone,
    formatAiCount,
    formatAiMoney,
    formatAiMoneyCompact,
    formatAiPlanDone,
} from '../lib/ai-finance.util';
import {
    aiLongRowMetricKind,
    aiScoreShare,
    aiScoreTone,
    formatAiMetricValue,
    formatAiPct,
    formatAiScore,
} from '../lib/ai-score.util';
import { formatAiBasisLine, isAiBasisRate } from '../lib/ai-attention.util';
import { clampAiPeriod } from '../lib/ai-period.util';
import {
    groupAiRows,
    pickAiCellSections,
    sortAiRows,
} from '../lib/ai-overview.util';
import {
    buildAiLevelsForm,
    toAiLevelsPayload,
    validateAiLevelRow,
} from '../lib/ai-levels.util';
import {
    buildAiCallTypeOptions,
    resolveAiByTypeCallType,
} from '../lib/ai-call-types.data';
import { attentionItem, cell, managerRow, metric } from './ai-fixtures';

// Неразрывный пробел ru-RU: сравниваем без учёта вида пробелов.
const plain = (value: string) => value.replace(/\s/g, ' ');

describe('финансы', () => {
    it('formatAiMoney / compact', () => {
        expect(plain(formatAiMoney(1234567.4))).toBe('1 234 567 ₽');
        expect(formatAiMoney(null)).toBe('0 ₽');
        expect(plain(formatAiMoneyCompact(1_250_000))).toBe('1,3 млн ₽');
        expect(plain(formatAiMoneyCompact(340_000))).toBe('340 тыс ₽');
        expect(plain(formatAiMoneyCompact(900))).toBe('900 ₽');
        expect(formatAiMoneyCompact(Number.NaN)).toBe('0 ₽');
    });

    it('план CRM: сделано / запланировано, доля и тон', () => {
        expect(plain(formatAiPlanDone(12, 20))).toBe('12 / 20');
        expect(formatAiPlanDone(12, 0)).toBe('12 / —');
        expect(aiPlanShare(12, 20)).toBe(0.6);
        expect(aiPlanShare(12, 0)).toBeNull();
        expect(aiPlanTone(1.2)).toBe('success');
        expect(aiPlanTone(0.6)).toBe('warning');
        expect(aiPlanTone(0.2)).toBe('destructive');
        expect(aiPlanTone(null)).toBe('success');
        expect(formatAiCount(null)).toBe('—');
    });
});

describe('оценки', () => {
    it('formatAiScore / Pct / по виду', () => {
        expect(formatAiScore(6.43)).toBe('6,4');
        expect(formatAiScore(null)).toBe('—');
        expect(formatAiPct(42.4)).toBe('42 %');
        expect(formatAiMetricValue(0.42, 'rate')).toBe('42 %');
        expect(formatAiMetricValue(7, 'count')).toBe('7');
    });

    it('доля и тон полосы оценки', () => {
        expect(aiScoreShare(6.4)).toBeCloseTo(0.64);
        expect(aiScoreShare(null)).toBe(0);
        expect(aiScoreTone(7.5)).toBe('success');
        expect(aiScoreTone(5)).toBe('warning');
        expect(aiScoreTone(3)).toBe('destructive');
    });

    it('вид метрики длинной строки', () => {
        expect(aiLongRowMetricKind('score')).toBe('score');
        expect(aiLongRowMetricKind('section')).toBe('score');
        expect(aiLongRowMetricKind('kpi')).toBe('count');
        expect(aiLongRowMetricKind('checklist')).toBe('pct');
        expect(aiLongRowMetricKind('objection')).toBe('pct');
    });
});

describe('основание карточки «Внимание»', () => {
    it('доля с нормой, n и интервалом', () => {
        expect(isAiBasisRate('next_step_date_rate')).toBe(true);
        expect(isAiBasisRate('risk_calls')).toBe(false);
        expect(
            formatAiBasisLine({
                code: 'next_step_date_rate',
                value: 0.31,
                norm: 0.5,
                n: 24,
                ci90: [0.2, 0.45],
            }),
        ).toBe('Шаг с датой: 31 % (норма 50 %) · n = 24 · 90 %: 20–45 %');
    });

    it('счётчик без n (значение из настройки) и неизвестный код', () => {
        expect(formatAiBasisLine({ code: 'plan_head', value: 30, n: 0 })).toBe(
            'План руководителя: 30',
        );
        expect(formatAiBasisLine({ code: 'weird', value: 2, n: 2 })).toBe(
            'weird: 2 · n = 2',
        );
    });
});

describe('clampAiPeriod', () => {
    it('в лимите — как есть; длиннее 3 мес. — начало к to − 3 мес. + 1 день', () => {
        expect(clampAiPeriod('2026-08-01', '2026-08-31')).toEqual({
            from: '2026-08-01',
            to: '2026-08-31',
            clamped: false,
        });
        expect(clampAiPeriod('2026-01-01', '2026-08-31')).toEqual({
            from: '2026-06-01',
            to: '2026-08-31',
            clamped: true,
        });
    });

    it('битые или перевёрнутые даты — null', () => {
        expect(clampAiPeriod('', '2026-08-31')).toBeNull();
        expect(clampAiPeriod('2026-09-01', '2026-08-31')).toBeNull();
        expect(clampAiPeriod('garbage', '2026-08-31')).toBeNull();
    });
});

const user = (id: number): BXUser => ({ ID: id }) as unknown as BXUser;
const department = (
    id: number,
    name: string,
    users: number[],
    groups: BXDepartment[] = [],
): SalesDepartment => ({
    department: { ID: id, NAME: name } as unknown as BXDepartment,
    groups,
    allUsers: users.map(user),
});

describe('groupAiRows / sortAiRows', () => {
    it('сигнал выше, затем по ключевой цифре по возрастанию, без оценки — в конец', () => {
        const rows = sortAiRows([
            managerRow({ managerId: '1', keyMetric: metric(8, 30) }),
            managerRow({ managerId: '2', keyMetric: metric(null, 3) }),
            managerRow({ managerId: '3', keyMetric: metric(4, 30) }),
            managerRow({
                managerId: '4',
                signal: attentionItem({ managerId: '4', rank: 2 }),
            }),
        ]);
        expect(rows.map(row => row.managerId)).toEqual(['4', '3', '1', '2']);
    });

    it('один отдел без групп — одна плоская секция без имени', () => {
        const sections = groupAiRows(
            [managerRow({ managerId: '7' })],
            [department(10, 'ОП', [7])],
            false,
        );
        expect(sections).toHaveLength(1);
        expect(sections[0]?.name).toBe('');
        expect(sections[0]?.rows).toHaveLength(1);
    });

    it('группы → секции по группам, «Без группы» и «Вне структуры»', () => {
        const group = {
            ID: 20,
            NAME: 'Группа А',
            USERS: [user(7)],
        } as unknown as BXDepartment;
        const sections = groupAiRows(
            [
                managerRow({ managerId: '7' }),
                managerRow({ managerId: '3' }),
                managerRow({ managerId: '99' }),
            ],
            [department(10, 'ОП', [7, 3], [group])],
            false,
        );
        expect(sections.map(section => section.name)).toEqual([
            'Группа А',
            'Без группы',
            'Вне структуры',
        ]);
        expect(sections[2]?.rows[0]?.managerId).toBe('99');
    });

    it('мультипортал без групп — секции по отделам', () => {
        const sections = groupAiRows(
            [managerRow({ managerId: '7' }), managerRow({ managerId: '3' })],
            [department(10, 'ОП 1', [7]), department(11, 'ОП 2', [3])],
            true,
        );
        expect(sections.map(section => section.name)).toEqual(['ОП 1', 'ОП 2']);
    });

    it('pickAiCellSections: по применимости, не больше 4', () => {
        const section = (code: string, relevance: number, n = 10) => ({
            section: code,
            title: code,
            avgScore: 5,
            n,
            avgRelevance: relevance,
            explanation: { text: '', basis: [], evidenceCallIds: [] },
        });
        const picked = pickAiCellSections(
            cell({
                sections: [
                    section('A', 10),
                    section('B', 90),
                    section('C', 50),
                    section('D', 70),
                    section('E', 60),
                ],
            }),
        );
        expect(picked.map(item => item.section)).toEqual(['B', 'D', 'E', 'C']);
    });
});

describe('форма уровней', () => {
    it('строится из обзора и превращается в payload без пустого since', () => {
        const form = buildAiLevelsForm([
            managerRow({
                managerId: '7',
                level: 'junior',
                levelSource: 'manual',
            }),
        ]);
        expect(form[0]).toMatchObject({
            managerId: 7,
            level: 'junior',
            manual: true,
            since: '',
        });
        expect(
            toAiLevelsPayload([{ ...form[0]!, since: '2026-01-15' }]),
        ).toEqual([{ managerId: 7, level: 'junior', since: '2026-01-15' }]);
        expect(toAiLevelsPayload(form)).toEqual([
            { managerId: 7, level: 'junior' },
        ]);
    });

    it('валидация since: формат и не позже сегодня', () => {
        const row = buildAiLevelsForm([managerRow()])[0]!;
        expect(validateAiLevelRow(row, '2026-09-07')).toBeNull();
        expect(
            validateAiLevelRow({ ...row, since: '2026-09-08' }, '2026-09-07'),
        ).toBe('Дата не позже сегодня');
        expect(
            validateAiLevelRow({ ...row, since: '07.09.2026' }, '2026-09-07'),
        ).toBe('Дата в формате ГГГГ-ММ-ДД');
        expect(
            validateAiLevelRow({ ...row, since: '2026-09-07' }, '2026-09-07'),
        ).toBeNull();
    });
});

describe('подвкладки типов', () => {
    it('опции: «Все» первой, типы портала в порядке, «Возражения» последней', () => {
        const options = buildAiCallTypeOptions([
            {
                code: 'presentation',
                title: 'Презентации',
                tone: 'event-pres',
                bucket: 'presentation',
                kpiPrimaryEventTypeCode: null,
            },
            {
                code: 'cold',
                title: 'Холод',
                tone: 'event-cold',
                bucket: 'contact',
                kpiPrimaryEventTypeCode: null,
            },
            {
                code: 'other',
                title: 'Прочее',
                tone: 'neutral',
                bucket: null,
                kpiPrimaryEventTypeCode: null,
            },
        ]);
        expect(options.map(option => option.value)).toEqual([
            'all',
            'cold',
            'presentation',
            'objections',
        ]);
        expect(options[0]?.label).toBe('Все');
    });

    it('без карты портала — фолбэк-порядок, «Все» всё равно первой', () => {
        expect(buildAiCallTypeOptions([])[0]?.value).toBe('all');
    });

    it('в by-type выбор уходит как есть: all и objections не подменяются', () => {
        expect(resolveAiByTypeCallType('all')).toBe('all');
        expect(resolveAiByTypeCallType('objections')).toBe('objections');
        expect(resolveAiByTypeCallType('presentation')).toBe('presentation');
    });
});
