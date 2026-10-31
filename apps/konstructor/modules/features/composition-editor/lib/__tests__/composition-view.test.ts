import { describe, expect, it } from 'vitest';
import oldInit from '../../../../entities/catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '@/modules/entities/catalog';
import { defaultComposition } from '@/modules/entities/composition';
import { DEFAULT_COMPOSITION_VIEW, WEIGHT_MARK_BY_VIEW } from '../../model/types';
import {
    buildCompositionSections,
    describeSection,
    itemWeightMark,
} from '../composition-sections.util';
import { isCompositionViewMode, parseCompositionView, weightDots } from '../composition-view.util';

/**
 * Виды наполнения: настройка из кэша, метки веса и вес категории. Правила
 * состава от вида не зависят — их проверяют тесты composition.
 */
const catalog = catalogFromOldInit(oldInit);
const sections = buildCompositionSections(catalog);
const sectionOf = (code: string) => sections.find(section => section.code === code)!;
const buh = defaultComposition(catalog.complects.byCode['buh']!);

describe('настройка вида', () => {
    it('читает сохранённое, неизвестное и битое — по умолчанию', () => {
        expect(parseCompositionView({ mode: 'dense', showWeights: false })).toEqual({
            mode: 'dense',
            showWeights: false,
        });
        expect(parseCompositionView({ mode: 'plitka', showWeights: 'да' })).toEqual(DEFAULT_COMPOSITION_VIEW);
        expect(parseCompositionView(null)).toBeNull();
        expect(parseCompositionView('dense')).toBeNull();
        expect(isCompositionViewMode('summary')).toBe(true);
        expect(isCompositionViewMode('tiles')).toBe(false);
    });

    it('у каждого вида своя метка веса', () => {
        expect(WEIGHT_MARK_BY_VIEW).toEqual({ cards: 'tag', flat: 'number', dense: 'dots', summary: 'number' });
    });
});

describe('метки веса', () => {
    it('точки: целая — единица, половинка — 0.5', () => {
        expect(weightDots(0.5)).toEqual(['half']);
        expect(weightDots(1)).toEqual(['full']);
        expect(weightDots(3)).toEqual(['full', 'full', 'full']);
        expect(weightDots(2.5)).toEqual(['full', 'full', 'half']);
        expect(weightDots(0)).toEqual([]);
    });

    it('ЭР внутри пакета — «в пакете», отдельная — свой вес', () => {
        const composition = { ...buh, ersInPacket: ['ertax'] };
        const er = sectionOf('er');
        const item = (code: string) => er.items.find(candidate => candidate.code === code)!;
        expect(itemWeightMark(composition, 'er', item('ertax'))).toBe('in-packet');
        expect(itemWeightMark(composition, 'er', item('ercorp'))).toBe(0.5);
    });

    it('у LT метка только у «тяжёлых» сервисов', () => {
        const lt = sectionOf('lt');
        expect(lt.items.find(item => item.code === 'ltsut')?.weight).toBeNull();
        expect(lt.items.find(item => item.code === 'ltcheckdocprem')?.weight).toBe(2);
    });
});

describe('вес категории', () => {
    it('сумма отмеченного; ЭР в пакете не весят', () => {
        const composition = { ...buh, ers: ['ercorp'], ersInPacket: ['ertax'] };
        const er = describeSection(sectionOf('er'), composition, true);
        expect(er.checkedItems.map(item => item.code)).toEqual(expect.arrayContaining(['ercorp', 'ertax']));
        expect(er.weight).toBe(0.5);
    });

    it('скрытые веса: меток и суммы нет, «в пакете» остаётся', () => {
        const composition = { ...buh, ers: ['ercorp'], ersInPacket: ['ertax'] };
        const er = describeSection(sectionOf('er'), composition, false);
        expect(er.weight).toBeNull();
        expect(er.items.find(item => item.code === 'ercorp')?.mark).toBeNull();
        expect(er.items.find(item => item.code === 'ertax')?.mark).toBe('in-packet');
    });

    it('LT в вес комплекта не входит — суммы нет', () => {
        expect(describeSection(sectionOf('lt'), buh, true).weight).toBeNull();
    });
});
