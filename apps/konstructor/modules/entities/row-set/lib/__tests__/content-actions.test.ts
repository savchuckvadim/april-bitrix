import { describe, expect, it } from 'vitest';
import { rowSetActions } from '../../model/RowSetSlice';
import { isRowSetContentAction } from '../content-actions';

type RowSetActionName = keyof typeof rowSetActions;

/** Действия, после которых содержимое документов меняется. */
const CONTENT: RowSetActionName[] = [
    'upsertRow',
    'replaceServiceRow',
    'removeRow',
    'addComparisonSet',
    'removeComparisonSet',
    'toggleCollapsed',
    'editRowCommercial',
    'editTotalCommercial',
    'renameRow',
    'toggleDiscountMode',
    'setRowComposition',
    'writeSyncedSet',
    'restore',
];

/** Действия экрана и вспомогательные: документы от них не устаревают. */
const OUTSIDE: RowSetActionName[] = [
    'selectRow',
    'setWithTax',
    'resyncSet',
    'startSetEditing',
    'stopSetEditing',
    'setContext',
    'reset',
];

describe('isRowSetContentAction', () => {
    it.each(CONTENT)('%s меняет содержимое документов', name => {
        expect(isRowSetContentAction({ type: rowSetActions[name].type })).toBe(true);
    });

    it.each(OUTSIDE)('%s документы не затрагивает', name => {
        expect(isRowSetContentAction({ type: rowSetActions[name].type })).toBe(false);
    });

    it('каждое действие набора разнесено в один из двух списков: новое действие не пройдёт мимо', () => {
        expect([...CONTENT, ...OUTSIDE].sort()).toEqual(Object.keys(rowSetActions).sort());
    });
});
