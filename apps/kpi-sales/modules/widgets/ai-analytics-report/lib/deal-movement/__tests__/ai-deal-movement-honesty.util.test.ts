import { describe, expect, it } from 'vitest';
import {
    aiDmHonestyHeadline,
    aiDmHonestyHighColumn,
    aiDmHonestyRest,
    aiDmHonestyShare,
    aiDmProgressRange,
} from '../ai-deal-movement-honesty.util';
import { honesty } from './ai-deal-movement.fixtures';

const plain = (text: string): string => text.replace(/[\u00a0\u202f]/g, ' ');

describe('ai-deal-movement-honesty — честность оценок AI', () => {
    it('диапазон продвижения: «4–5», верх шкалы — одной цифрой', () => {
        expect(aiDmProgressRange(4)).toBe('4–5');
        expect(aiDmProgressRange(5)).toBe('5');
        expect(aiDmHonestyHighColumn(4)).toBe('Звонков с продвижением 4–5');
    });

    it('главная фраза: доля, «из» и срок проверки', () => {
        expect(plain(aiDmHonestyHeadline(honesty(), 12, 4))).toBe(
            'После звонков с продвижением 4–5 стадия не сдвинулась за 12 дней: 30 % (9 из 30)',
        );
    });

    it('проверенных нет — итог ещё не известен, без «0 %»', () => {
        const text = aiDmHonestyHeadline(
            honesty({ checked: 0, still: 0, moved: 0, stillPct: null, pending: 7 }),
            12,
            4,
        );
        expect(text).toBe(
            'Звонков с продвижением 4–5 за период: 40. Проверенных пока нет — итог появится, когда после звонков пройдёт 12 дней.',
        );
        expect(text).not.toContain('%');
    });

    it('доля в таблице и прочерк без проверенных', () => {
        expect(plain(aiDmHonestyShare(honesty({ stillPct: 33.3, still: 1, checked: 3 })))).toBe(
            '33,3 % (1 из 3)',
        );
        expect(aiDmHonestyShare(honesty({ stillPct: null, checked: 0 }))).toBe('—');
    });

    it('ждут срока и не проверены — только ненулевые', () => {
        expect(aiDmHonestyRest(honesty())).toBe('Ещё ждут срока: 6 · Не проверены: 4');
        expect(aiDmHonestyRest(honesty({ pending: 0 }))).toBe('Не проверены: 4');
        expect(aiDmHonestyRest(honesty({ pending: 0, unchecked: 0 }))).toBeNull();
    });
});
