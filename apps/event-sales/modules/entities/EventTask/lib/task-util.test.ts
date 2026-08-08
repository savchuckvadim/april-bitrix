import { describe, expect, it } from 'vitest';
import type { BXTask } from '@workspace/bx';
import { checkIfTaskIsOverdue } from './task-util';

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
