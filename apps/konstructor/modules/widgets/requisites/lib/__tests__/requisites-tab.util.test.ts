import { describe, expect, it } from 'vitest';
import {
    isRequisitesTab,
    resolveRequisitesTab,
    type RequisitesTab,
} from '../requisites-tab.util';

describe('resolveRequisitesTab', () => {
    it.each<RequisitesTab>(['base', 'addresses', 'bank'])(
        'у сохранённого реквизита вкладка %s остаётся',
        tab => {
            expect(resolveRequisitesTab(tab, true)).toBe(tab);
        },
    );

    it.each<RequisitesTab>(['addresses', 'bank'])(
        'у шаблона вкладка %s сменяется основной: менеджер ушёл на неё и сменил тип клиента',
        tab => {
            expect(resolveRequisitesTab(tab, false)).toBe('base');
        },
    );
});

describe('isRequisitesTab', () => {
    it('узнаёт вкладки экрана и отбрасывает чужие значения', () => {
        expect(isRequisitesTab('bank')).toBe(true);
        expect(isRequisitesTab('contract')).toBe(false);
    });
});
