import type { Catalog, KInfogroup } from '@/modules/entities/catalog';
import {
    isIskraService,
    ltServiceCount,
    type Composition,
    type CompositionAction,
    type LtPlacement,
} from '@/modules/entities/composition';

export type SectionKind = 'infoblock' | 'er' | 'erPacket' | 'lt';

export interface CompositionSectionItem {
    code: string;
    name: string;
    /** Вес блока; у LT — только «тяжёлые» сервисы (занимают несколько слотов) */
    weight: number | null;
}

/** Что показать меткой: вес, «в пакете» (ЭР там не весит) или ничего */
export type WeightMarkValue = number | 'in-packet' | null;

/** Что нужно знать о LT-сервисе основного списка */
export interface LtItemInfo {
    /** Куда система его положила; null — не отмечен */
    placement: LtPlacement | null;
    /** Закреплён в комплекте: снять нельзя (в режиме правил) */
    locked: boolean;
    /** Искра: вхождений в сборку и своя подпись для документов */
    iskra: { code: string; count: number; subtitle: string | null; baseName: string } | null;
}

export interface CompositionSectionItemView extends CompositionSectionItem {
    checked: boolean;
    mark: WeightMarkValue;
    /** Только у пунктов Legal Tech */
    lt: LtItemInfo | null;
}

export interface CompositionSectionView extends Omit<CompositionSection, 'items'> {
    items: CompositionSectionItemView[];
    checkedItems: CompositionSectionItemView[];
    /** Вес отмеченного в категории; null — скрыт настройкой или LT (в вес комплекта не входит) */
    weight: number | null;
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
                return block && !block.isFree
                    ? [{ code: block.code, name: block.name, weight: block.weight }]
                    : [];
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
            weight: service.weight > 1 ? service.weight : null,
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

/** Метка блока: ЭР внутри активного пакета веса не имеет */
export const itemWeightMark = (
    composition: Composition | null,
    kind: SectionKind,
    item: CompositionSectionItem,
): WeightMarkValue =>
    kind === 'er' && composition?.ersInPacket.includes(item.code)
        ? 'in-packet'
        : item.weight;

const ltPlacementOf = (composition: Composition, code: string): LtPlacement | null => {
    if (composition.lt.includes(code)) return 'included';
    return composition.ltInPacket.includes(code) ? 'paid' : null;
};

const describeLtItem = (
    composition: Composition | null,
    item: CompositionSectionItem,
    pinnedLt: string | null,
): LtItemInfo => ({
    placement: composition && ltPlacementOf(composition, item.code),
    locked: pinnedLt === item.code && composition?.mode === 'rules',
    iskra: isIskraService(item.code)
        ? {
              code: item.code,
              count: composition ? ltServiceCount(composition, item.code) : 0,
              subtitle: composition?.ltSubtitles?.[item.code] ?? null,
              baseName: item.name,
          }
        : null,
});

/** Категория для отрисовки: отметки, метки с учётом настройки, вес отмеченного */
export const describeSection = (
    section: CompositionSection,
    composition: Composition | null,
    showWeights: boolean,
    pinnedLt: string | null = null,
): CompositionSectionView => {
    const items = section.items.map(item => {
        const mark = itemWeightMark(composition, section.kind, item);
        const lt = section.kind === 'lt' ? describeLtItem(composition, item, pinnedLt) : null;
        return {
            ...item,
            name: lt?.iskra?.subtitle ?? item.name,
            checked: composition !== null && isSectionItemChecked(composition, section.kind, item.code),
            // «в пакете» — не вес, а состояние: остаётся и при скрытых весах
            mark: showWeights || mark === 'in-packet' ? mark : null,
            lt,
        };
    });
    const checkedItems = items.filter(item => item.checked);
    const weight = checkedItems.reduce(
        (sum, item) => sum + (typeof item.mark === 'number' ? item.mark : 0),
        0,
    );
    return {
        ...section,
        items,
        checkedItems,
        weight: showWeights && section.kind !== 'lt' ? weight : null,
    };
};

export const toggleSectionItem = (
    kind: SectionKind,
    code: string,
    checked: boolean,
): CompositionAction => ({ kind: TOGGLE_KIND[kind], code, checked });
