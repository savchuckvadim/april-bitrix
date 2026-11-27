import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
    checkComplectWeight,
    defaultComposition,
    type Composition,
    type CompositionAction,
    type RuleViolation,
} from '@/modules/entities/composition';
import { regionsCatalog } from '../../lib/__fixtures__/regions-catalog';
import type { CompositionEditorState } from '../use-composition-editor';
import { useRegionsEditor, type RegionsEditorState } from '../use-regions-editor';

/**
 * Хук окна «Регионы» проверяется в серверном рендере: начальное состояние
 * черновика, итоги веса и сохранение. Переходы черновика (отметить, снять,
 * «считать вес») покрыты тестами regions-picker.util: хук лишь вызывает их.
 */
const complect = regionsCatalog.complects.byCode['classic']!;

const compositionWith = (patch: Partial<Composition>): Composition => ({
    ...defaultComposition(complect),
    infoblocks: ['rus', 'reg'],
    ...patch,
});

interface FakeEditor {
    editor: CompositionEditorState;
    applied: CompositionAction[];
}

const fakeEditor = (composition: Composition, accept = true, blocked: RuleViolation[] = []): FakeEditor => {
    const applied: CompositionAction[] = [];
    const editor = {
        catalog: regionsCatalog,
        composition,
        clientRegionCode: 'stv',
        weightCheck: checkComplectWeight(composition, { complect, catalog: regionsCatalog, regionCode: 'stv' }),
        applyComposition: (action: CompositionAction) => {
            applied.push(action);
            return accept;
        },
        messages: { violations: [], blocked, autoFixes: [] },
    } as unknown as CompositionEditorState;
    return { editor, applied };
};

const capture = (editor: CompositionEditorState, onClose: () => void): RegionsEditorState => {
    let state: RegionsEditorState | null = null;
    const Probe = () => {
        state = useRegionsEditor(editor, onClose);
        return null;
    };
    renderToStaticMarkup(createElement(Probe));
    if (!state) throw new Error('хук не вернул состояние');
    return state;
};

describe('useRegionsEditor', () => {
    const composition = compositionWith({ regions: ['stv'], regionsUnweighted: ['msk'] });

    it('черновик стартует с состава строки', () => {
        const { editor } = fakeEditor(composition);
        const state = capture(editor, vi.fn());
        expect(state.selectedCount).toBe(2);
        expect(state.weight).toBe(0.5);
        expect(state.changed).toBe(false);
        expect(state.clientRegionCode).toBe('stv');
        const byCode = Object.fromEntries(state.rows.map(row => [row.region.code, row]));
        expect(byCode['stv']).toMatchObject({ selected: true, counted: true });
        expect(byCode['msk']).toMatchObject({ selected: true, counted: false });
    });

    it('по умолчанию виден список портала; «Все регионы» можно включить', () => {
        const { editor } = fakeEditor(composition);
        const state = capture(editor, vi.fn());
        expect(state.rows.map(row => row.region.code).sort()).toEqual(['msk', 'stv']);
        expect(state.canToggleShowAll).toBe(true);
        expect(state.showAll).toBe(false);
    });

    it('фильтры с числом отмеченных, выбран «Все»', () => {
        const { editor } = fakeEditor(composition);
        const filters = capture(editor, vi.fn()).filters;
        expect(filters.map(item => [item.id, item.count, item.selected])).toEqual([
            ['all', null, true],
            ['selected', 2, false],
            ['counted', 1, false],
            ['unweighted', 1, false],
        ]);
    });

    it('вес состава после сохранения сравнивается с комплектом', () => {
        // classic весит 1: rus 0.5 + Ставрополь 0.5 = 1, Москва без веса не добавляет
        const { editor } = fakeEditor(composition);
        expect(capture(editor, vi.fn()).complectWeight).toEqual({ weight: 1, expected: 1, fits: true });
    });

    it('сохранение — одно действие setRegions и закрытие окна', () => {
        const { editor, applied } = fakeEditor(composition);
        const onClose = vi.fn();
        capture(editor, onClose).save();
        expect(applied).toEqual([{ kind: 'setRegions', counted: ['stv'], unweighted: ['msk'] }]);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('правило отклонило сохранение — окно остаётся открытым, причина видна', () => {
        const reason: RuleViolation = { code: 'regions/root-locked', message: 'Блок не снимается' };
        const { editor } = fakeEditor(composition, false, [reason]);
        const onClose = vi.fn();
        const state = capture(editor, onClose);
        state.save();
        expect(onClose).not.toHaveBeenCalled();
        expect(state.blocked).toEqual([reason]);
    });
});
