import { describe, expect, it } from 'vitest';
import type { InstallAicallResult } from '../model';
import { installFailureNotes } from './install-result';

const base: InstallAicallResult = {
    entityTypeId: 1038,
    created: false,
    fieldsAdded: [],
    fieldsExisting: [],
    fieldsFailed: [],
};

describe('installFailureNotes', () => {
    it('без отказов — ни строк, ни совета', () => {
        expect(installFailureNotes(base)).toEqual({ lines: [], advice: null });
    });

    it('лимит полей: причина по каждому полю и совет про саму сущность', () => {
        const notes = installFailureNotes({
            ...base,
            fieldsFailed: ['UF_CRM_9_TRANSCRIPT_1'],
            fieldLimitReached: true,
            fieldsFailedDetails: [
                {
                    fieldName: 'UF_CRM_9_TRANSCRIPT_1',
                    title: 'Транскрипт, часть 1',
                    reason: 'field_limit',
                    message: 'Достигнут лимит пользовательских полей',
                },
            ],
        });
        expect(notes.lines).toEqual([
            '«Транскрипт, часть 1» — Достигнут лимит пользовательских полей',
        ]);
        expect(notes.advice).toContain('на одну сущность');
        expect(notes.advice).toContain('в самом смарте');
    });

    it('только обрывы связи — совет повторить через минуту', () => {
        const notes = installFailureNotes({
            ...base,
            fieldsFailed: ['UF_CRM_9_AGENT_NAME'],
            fieldsFailedDetails: [
                {
                    fieldName: 'UF_CRM_9_AGENT_NAME',
                    title: 'Имя агента-аналитика',
                    reason: 'network',
                    message: 'socket hang up',
                },
            ],
        });
        expect(notes.advice).toContain('оборвал соединение');
    });

    it('старый ответ без причин — общий совет повторить', () => {
        const notes = installFailureNotes({
            ...base,
            fieldsFailed: ['UF_CRM_9_AGENT_NAME'],
        });
        expect(notes.lines).toEqual([]);
        expect(notes.advice).toContain('Повторите установку');
    });
});
