import { describe, expect, it } from 'vitest';
import oldInit from '../../../../entities/catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '@/modules/entities/catalog';
import { defaultComposition } from '@/modules/entities/composition';
import {
    buildCompositionSections,
    isSectionItemChecked,
    toggleSectionItem,
} from '../composition-sections.util';

const catalog = catalogFromOldInit(oldInit);

describe('composition sections', () => {
    const sections = buildCompositionSections(catalog);

    it('категории каталога + Legal Tech, бесплатные блоки не выбираются', () => {
        const codes = sections.map(section => section.code);
        expect(codes).toEqual(
            expect.arrayContaining(['npa', 'sud', 'cons', 'spec', 'er', 'per', 'lt']),
        );
        expect(codes).not.toContain('free');
        expect(sections.every(section => section.items.length > 0)).toBe(true);
    });

    it('пакет ЭР — свой вид, ЭР — свой', () => {
        expect(sections.find(section => section.code === 'per')?.kind).toBe(
            'erPacket',
        );
        expect(sections.find(section => section.code === 'er')?.kind).toBe('er');
    });

    it('отметки читаются из наполнения комплекта по умолчанию', () => {
        const complect = catalog.complects.prof[0]!;
        const composition = defaultComposition(complect);
        const npa = sections.find(section => section.code === 'npa')!;
        const checked = npa.items.filter(item =>
            isSectionItemChecked(composition, npa.kind, item.code),
        );
        expect(checked.length).toBe(
            npa.items.filter(item => composition.infoblocks.includes(item.code))
                .length,
        );
    });

    it('переключение даёт действие движка правил нужного вида', () => {
        expect(toggleSectionItem('erPacket', 'perur', true)).toEqual({
            kind: 'toggleErPacket',
            code: 'perur',
            checked: true,
        });
    });
});
