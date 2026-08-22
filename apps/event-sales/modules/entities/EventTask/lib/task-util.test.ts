import { describe, expect, it } from 'vitest';
import type { BXTask } from '@workspace/bx';
import { checkIfTaskIsOverdue, parseTaskTitle } from './task-util';
import { EV_TYPE } from '../types/event-task-type';

const task = (deadline: string | null): BXTask =>
    ({ deadline }) as unknown as BXTask;

describe('checkIfTaskIsOverdue', () => {
    it('задача без срока — «запланирован», а не 1970-й год', () => {
        expect(checkIfTaskIsOverdue(task(null))).toBe('no');
        expect(checkIfTaskIsOverdue(task(''))).toBe('no');
    });

    it('прошедший срок — просрочен', () => {
        expect(checkIfTaskIsOverdue(task('2000-01-01T10:00:00+03:00'))).toBe(
            'yes',
        );
    });

    it('будущий срок — запланирован', () => {
        expect(checkIfTaskIsOverdue(task('2099-01-01T10:00:00+03:00'))).toBe(
            'no',
        );
    });
});

describe('parseTaskTitle — «Доработка» (refine)', () => {
    it('распознаёт тип по первому слову заголовка', () => {
        const parsed = parseTaskTitle('Доработка  Снять вопросы по КП');
        expect(parsed.eventType).toBe('refine');
        expect(parsed.type).toBe(EV_TYPE.REFINE);
        expect(parsed.name).toBe('Снять вопросы по КП');
    });

    it('эмодзи-префикс задачи не мешает', () => {
        expect(parseTaskTitle('🔧 Доработка  Хвосты по цене').eventType).toBe(
            'refine',
        );
    });

    it('«Звонок» в названии НЕ перебивает доработку', () => {
        // Ветка «Доработка» стоит до проверки «Звонок»: иначе такой
        // заголовок читался бы как warm.
        const parsed = parseTaskTitle('Доработка  Звонок после КП');
        expect(parsed.eventType).toBe('refine');
    });

    it('обычный звонок не стал доработкой', () => {
        expect(parseTaskTitle('Звонок  Обсудить сроки').eventType).toBe('warm');
    });
});

describe('parseTaskTitle — «Доработка» только первым словом', () => {
    it('«Доработка» в свободном тексте плана НЕ меняет тип', () => {
        expect(parseTaskTitle('Звонок  Доработка сметы').eventType).toBe(
            'warm',
        );
        expect(parseTaskTitle('Презентация  Доработка макета').eventType).toBe(
            'presentation',
        );
    });
});
