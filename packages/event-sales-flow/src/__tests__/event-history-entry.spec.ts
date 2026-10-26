import { describe, expect, it } from 'vitest';
import { buildEventHistoryEntry } from '../services/history/event-history-comment.builder';
import {
    toBatchSafeText,
    toMultiFieldEntryText,
} from '../shared/batch/batch-text';

/*
 * Зеркало бэка (владелец 26.10.2026): «ОП История» — с переносами;
 * многострочный комментарий раньше превращался в «12 — 312 — 3 — …».
 */
describe('buildEventHistoryEntry', () => {
    const deadline = { toRuHumanDateTime: () => '27 октября 10:00' } as never;

    it('дата и что сделано — первой строкой, комментарий построчно, план — последней', () => {
        const entry = buildEventHistoryEntry('26.10.2026 11:06:59', {
            reportEventType: 'warm',
            planEventType: 'warm',
            reportComment:
                'Говорил с бухгалтером\n\n  перезвонить после 10  \nнужен счёт',
            planDeadline: deadline,
        });

        expect(entry).toBe(
            '26.10.2026 11:06:59 — Звонок совершён: Говорил с бухгалтером\n' +
                'перезвонить после 10\n' +
                'нужен счёт\n' +
                'Запланирован Звонок на 27 октября 10:00',
        );
        expect(toBatchSafeText(entry)).toContain('бухгалтером%0Aперезвонить');
        // Скаляр op_history — по-прежнему одной строкой.
        expect(toMultiFieldEntryText(entry)).not.toContain('\n');
    });
});
