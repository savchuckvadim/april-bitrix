import type { SmartResponseDto } from '@workspace/nest-admin-api';
import {
    SMART_NAMES,
    TYPED_GROUPS,
    type SmartName,
    type TypedGroup,
} from '../../../lib/model/common';
import { describeProcessRecord } from '../../../process/lib/utils/describe-process';
import type { ConstSmartRegistryItem } from '../../db/model';
import type { SmartGalleryCard, SmartGallerySource } from '../model';

const isSmartName = (value: string): value is SmartName =>
    SMART_NAMES.some((option) => option.value === value);
const isTypedGroup = (value: string): value is TypedGroup =>
    TYPED_GROUPS.some((option) => option.value === value);

const SOURCE_ORDER: Record<SmartGallerySource, number> = {
    const: 0,
    excel: 1,
    manual: 2,
};

/** Установленная строка `smarts` → карточка (const / excel / manual). */
function buildInstalledCard(
    smart: SmartResponseDto,
    registry: ConstSmartRegistryItem[],
    monitoring: unknown,
): SmartGalleryCard {
    const card: SmartGalleryCard = {
        key: `db-${smart.id}`,
        title: smart.title,
        name: smart.name,
        group: smart.group,
        type: smart.type,
        source: 'manual',
        installed: true,
        entityTypeId: smart.entityTypeId,
        dbSmart: smart,
    };

    const constItem = registry.find(
        (item) => item.type === smart.type && item.group === smart.group,
    );
    if (constItem) {
        card.source = 'const';
        card.constKind = constItem.kind;
        card.fieldCount = constItem.fieldsCount;
        return card;
    }

    if (isSmartName(smart.name) && isTypedGroup(smart.group)) {
        card.source = 'excel';
        card.template = { name: smart.name, group: smart.group };
        const desc = describeProcessRecord(monitoring, smart.name, smart.group);
        card.inBitrix = desc.inBitrix;
        card.fieldCount = desc.fieldCount;
        card.funnelCount = desc.funnelCount;
        card.stageCount = desc.stageCount;
        if (card.entityTypeId === undefined) {
            card.entityTypeId = desc.entityTypeId;
        }
    }
    return card;
}

/** Запись const-реестра без установленной строки → карточка «не установлен». */
function buildConstCard(item: ConstSmartRegistryItem): SmartGalleryCard {
    return {
        key: `const-${item.kind}`,
        title: item.title,
        name: item.code,
        group: item.group,
        type: item.type,
        source: 'const',
        installed: false,
        fieldCount: item.fieldsCount,
        constKind: item.kind,
    };
}

/** Эталонный Excel-смарт без установленной строки → карточка «не установлен». */
function buildTemplateCard(
    name: SmartName,
    templateGroup: TypedGroup,
    monitoring: unknown,
): SmartGalleryCard {
    const desc = describeProcessRecord(monitoring, name, templateGroup);
    return {
        key: `tpl-${name}`,
        title: name,
        name,
        group: templateGroup,
        source: 'excel',
        installed: false,
        inBitrix: desc.inBitrix,
        entityTypeId: desc.entityTypeId,
        fieldCount: desc.fieldCount,
        funnelCount: desc.funnelCount,
        stageCount: desc.stageCount,
        template: { name, group: templateGroup },
    };
}

/**
 * Чистый merge трёх источников галереи смартов:
 * (а) строки `smarts` портала → installed; источник — const по паре
 *     type+group из реестра, иначе excel по эталонному name+group
 *     (с best-effort обогащением из мониторинга), иначе manual;
 * (б) записи const-реестра без установленной строки → доступные к установке;
 * (в) эталонные SMART_NAMES без установленной строки (по name в любой группе)
 *     → доступные к полной установке в выбранную группу шаблонных.
 * Сортировка: установленные → const → excel → manual; внутри — по title.
 */
export function buildSmartGalleryCards({
    dbSmarts,
    registry,
    monitoring,
    templateGroup,
}: {
    dbSmarts: SmartResponseDto[];
    registry: ConstSmartRegistryItem[];
    monitoring: unknown;
    templateGroup: TypedGroup;
}): SmartGalleryCard[] {
    const cards: SmartGalleryCard[] = dbSmarts.map((smart) =>
        buildInstalledCard(smart, registry, monitoring),
    );

    for (const item of registry) {
        const installed = dbSmarts.some(
            (smart) => smart.type === item.type && smart.group === item.group,
        );
        if (!installed) cards.push(buildConstCard(item));
    }

    for (const option of SMART_NAMES) {
        const installed = dbSmarts.some(
            (smart) => smart.name === option.value,
        );
        if (!installed) {
            cards.push(
                buildTemplateCard(option.value, templateGroup, monitoring),
            );
        }
    }

    return cards.sort(
        (a, b) =>
            Number(b.installed) - Number(a.installed) ||
            SOURCE_ORDER[a.source] - SOURCE_ORDER[b.source] ||
            a.title.localeCompare(b.title, 'ru'),
    );
}
