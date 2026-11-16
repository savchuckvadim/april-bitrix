import { describe, expect, it } from 'vitest';
import {
    anchorsOf,
    filledBands,
    isOwnLayer,
    knowledgeOf,
    setAnchor,
    setKnowledgeLayer,
    toggleKnowledge,
    trimAnchors,
} from './methodology-materials.util';

describe('якоря оценок методики', () => {
    it('читает якоря из конфига, отбрасывая чужую форму и пустые описания', () => {
        expect(anchorsOf(undefined)).toEqual({});
        expect(anchorsOf('мусор')).toEqual({});
        expect(
            anchorsOf({
                NEEDS: { '1-2': 'не выяснял', '3-4': '', '5-6': 7 },
                PRICE: 'строка',
                CLOSING: {},
            }),
        ).toEqual({ NEEDS: { '1-2': 'не выяснял' } });
    });

    it('описание полосы ставится и убирается; без якорей поля в конфиге нет', () => {
        const one = setAnchor({}, 'NEEDS', '1-2', 'не выяснял');
        expect(one).toEqual({ NEEDS: { '1-2': 'не выяснял' } });

        const two = setAnchor(one ?? {}, 'NEEDS', '9-10', 'уточнил каждую');
        expect(filledBands(two ?? {}, 'NEEDS')).toBe(2);
        expect(filledBands(two ?? {}, 'PRICE')).toBe(0);

        const back = setAnchor(two ?? {}, 'NEEDS', '9-10', '');
        expect(back).toEqual({ NEEDS: { '1-2': 'не выяснял' } });
        // Последняя полоса убрана — якорей нет вовсе.
        expect(setAnchor(back ?? {}, 'NEEDS', '1-2', '')).toBeUndefined();
    });

    it('на потерю фокуса пробелы по краям срезаются, пустые полосы уходят', () => {
        expect(
            trimAnchors({
                NEEDS: { '1-2': '  не выяснял  ', '3-4': '   ' },
                PRICE: { '1-2': ' ' },
            }),
        ).toEqual({ NEEDS: { '1-2': 'не выяснял' } });
        expect(trimAnchors({ PRICE: { '1-2': ' ' } })).toBeUndefined();
    });
});

describe('материалы методики', () => {
    it('читает материалы из конфига, отбрасывая чужую форму', () => {
        expect(knowledgeOf(null)).toEqual({});
        expect(
            knowledgeOf({ 'product-facts': 'shared', broken: 5, empty: '' }),
        ).toEqual({ 'product-facts': 'shared' });
    });

    it('новый вид получает слой «общий документ», снятый — уходит; пусто — поля нет', () => {
        const on = toggleKnowledge({}, 'product-facts', true);
        expect(on).toEqual({ 'product-facts': 'shared' });
        // Повторное включение слой не сбрасывает.
        expect(
            toggleKnowledge({ 'product-facts': 'polyansky' }, 'product-facts', true),
        ).toEqual({ 'product-facts': 'polyansky' });
        expect(toggleKnowledge(on ?? {}, 'product-facts', false)).toBeUndefined();
    });

    it('слой «документ этой методики» — её код; без кода остаётся общий', () => {
        const knowledge = { 'objection-playbook': 'shared' };

        const own = setKnowledgeLayer(knowledge, 'objection-playbook', true, 'polyansky');
        expect(own).toEqual({ 'objection-playbook': 'polyansky' });
        expect(isOwnLayer(own, 'objection-playbook')).toBe(true);
        expect(isOwnLayer(knowledge, 'objection-playbook')).toBe(false);
        expect(isOwnLayer(knowledge, 'product-facts')).toBe(false);

        expect(
            setKnowledgeLayer(own, 'objection-playbook', false, 'polyansky'),
        ).toEqual({ 'objection-playbook': 'shared' });
        expect(setKnowledgeLayer(knowledge, 'objection-playbook', true, '')).toEqual({
            'objection-playbook': 'shared',
        });
    });
});
