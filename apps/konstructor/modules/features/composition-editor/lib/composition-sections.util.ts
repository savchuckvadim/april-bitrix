import type { Catalog, KInfogroup } from '@/modules/entities/catalog';
import type {
    Composition,
    CompositionAction,
} from '@/modules/entities/composition';

export type SectionKind = 'infoblock' | 'er' | 'erPacket' | 'lt';

export interface CompositionSectionItem {
    code: string;
    name: string;
}

export interface CompositionSection {
    code: string;
    title: string;
    kind: SectionKind;
    items: CompositionSectionItem[];
}

const TOGGLE_KIND = {
    infoblock: 'toggleInfoblock',
    er: 'toggleEr',
    erPacket: 'toggleErPacket',
    lt: 'toggleLt',
} as const;

/** Вид группы каталога; бесплатные блоки в редакторе не выбираются. */
const kindOfGroup = (group: KInfogroup): SectionKind | null => {
    if (group.code === 'per') return 'erPacket';
    if (group.type === 'er') return 'er';
    if (group.type === 'infoblocks') return 'infoblock';
    return null;
};

/**
 * Категории наполнения по группам каталога (легаси CheckboxesContainer) +
 * Legal Tech отдельной категорией. Пустые категории не показываются.
 */
export const buildCompositionSections = (
    catalog: Catalog,
): CompositionSection[] => {
    const sections: CompositionSection[] = [];
    for (const group of catalog.groups) {
        const kind = kindOfGroup(group);
        if (!kind) continue;
        sections.push({
            code: group.code,
            title: group.name,
            kind,
            items: group.infoblockCodes.flatMap(code => {
                const block = catalog.infoblocks[code];
                return block ? [{ code: block.code, name: block.name }] : [];
            }),
        });
    }
    sections.push({
        code: 'lt',
        title: 'Legal Tech',
        kind: 'lt',
        items: catalog.services.lt.map(service => ({
            code: service.code,
            name: service.name,
        })),
    });
    return sections.filter(section => section.items.length > 0);
};

/** Отмечен ли пункт: ЭР и LT считаются и выбранными сами, и через пакет. */
export const isSectionItemChecked = (
    composition: Composition,
    kind: SectionKind,
    code: string,
): boolean => {
    switch (kind) {
        case 'infoblock':
            return composition.infoblocks.includes(code);
        case 'er':
            return (
                composition.ers.includes(code) ||
                composition.ersInPacket.includes(code)
            );
        case 'erPacket':
            return composition.erPackets.includes(code);
        case 'lt':
            return (
                composition.lt.includes(code) ||
                composition.ltInPacket.includes(code)
            );
    }
};

export const toggleSectionItem = (
    kind: SectionKind,
    code: string,
    checked: boolean,
): CompositionAction => ({ kind: TOGGLE_KIND[kind], code, checked });
