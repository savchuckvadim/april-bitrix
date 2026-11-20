import { describe, expect, it } from 'vitest';
import {
    aiDmAmountShort,
    aiDmAsOf,
    aiDmCalls,
    aiDmCountWithSum,
    aiDmDays,
    aiDmDealAmount,
    aiDmDeals,
    aiDmFewCallsNote,
    aiDmKnownNames,
    aiDmManagerName,
    aiDmNightLabel,
    aiDmPercent,
    aiDmSince,
    aiDmStageTiming,
} from '../ai-deal-movement-format.util';
import { deal } from './ai-deal-movement.fixtures';

const NBSP = '\u00a0';
const plain = (text: string): string => text.replace(/[\u00a0\u202f]/g, ' ');

describe('ai-deal-movement-format — числа, суммы, сроки', () => {
    it('склоняет дни, сделки и звонки', () => {
        expect(aiDmDays(1)).toBe('1 день');
        expect(aiDmDays(12)).toBe('12 дней');
        expect(aiDmDeals(3)).toBe('3 сделки');
        expect(aiDmDeals(21)).toBe('21 сделка');
        expect(aiDmCalls(54)).toBe('54 звонка');
    });

    it('сумма коротко и в подсказке; ночь без сумм — «сумма не посчитана»', () => {
        expect(plain(aiDmAmountShort(1_250_000))).toBe('1,3 млн ₽');
        expect(aiDmAmountShort(null)).toBe('сумма не посчитана');
        expect(plain(aiDmCountWithSum(12, 1_250_000))).toBe('12 сделок на 1 250 000 ₽');
        expect(aiDmCountWithSum(2, null)).toBe('2 сделки, сумма не посчитана');
    });

    it('сумма сделки: не указана — словами', () => {
        expect(plain(aiDmDealAmount(150_000))).toBe('150 000 ₽');
        expect(aiDmDealAmount(null)).toBe('не указана');
    });

    it('срок стадии с пометкой источника', () => {
        expect(aiDmStageTiming(deal())).toBe(
            'в стадии 34 дн. при обычных 21 (по истории портала)',
        );
        expect(aiDmStageTiming(deal({ stageLimitSource: 'default' }))).toBe(
            'в стадии 34 дн. при обычных 21 (общий порог)',
        );
    });

    it('с какой ночи: дата словами, нет — «с начала наблюдений»', () => {
        expect(aiDmSince('2026-11-16T09:00:00.000Z')).toBe('с 16.11.2026');
        expect(aiDmSince(null)).toBe('с начала наблюдений');
        expect(aiDmSince('битая дата')).toBe('с начала наблюдений');
    });

    it('ночь на оси и «на ночь» в шапке — без сырых ключей', () => {
        expect(aiDmNightLabel('2026-11-19')).toBe('19.11');
        expect(aiDmNightLabel('nope')).toBe('—');
        expect(aiDmAsOf('2026-11-19')).toBe('На ночь 19.11.2026');
    });

    it('доля с одной цифрой после запятой и неразрывным пробелом', () => {
        expect(aiDmPercent(30)).toBe(`30${NBSP}%`);
        expect(aiDmPercent(33.33)).toBe(`33,3${NBSP}%`);
    });

    it('пометка «мало звонков»: текст сервера, запасной или ничего', () => {
        expect(aiDmFewCallsNote({ fewCalls: true, note: 'мало звонков' }, 'запас')).toBe(
            'мало звонков',
        );
        expect(aiDmFewCallsNote({ fewCalls: true, note: null }, 'запас')).toBe('запас');
        expect(aiDmFewCallsNote({ fewCalls: false, note: null }, 'запас')).toBeNull();
    });
});

describe('ai-deal-movement-format — имена менеджеров', () => {
    const fallback = (id: string): string => `Сотрудник #${id}`;

    it('имя сервера, иначе из структуры, без ответственного — словами', () => {
        expect(aiDmManagerName('447', 'Иванова Анна', fallback)).toBe('Иванова Анна');
        expect(aiDmManagerName('447', null, fallback)).toBe('Сотрудник #447');
        expect(aiDmManagerName('447', '  ', fallback)).toBe('Сотрудник #447');
        expect(aiDmManagerName(null, null, fallback)).toBe('Ответственный не назначен');
    });

    it('известные имена собираются из всех ответов, первое имя побеждает', () => {
        const names = aiDmKnownNames([
            [{ managerId: '447', managerName: 'Иванова Анна' }],
            [
                { managerId: '447', managerName: 'Другое имя' },
                { managerId: '512', managerName: null },
                { managerId: null, managerName: 'Без id' },
                { managerId: '600', managerName: 'Петров Пётр' },
            ],
        ]);
        expect([...names.entries()]).toEqual([
            ['447', 'Иванова Анна'],
            ['600', 'Петров Пётр'],
        ]);
    });
});
