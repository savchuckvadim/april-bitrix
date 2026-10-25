import type { Catalog, KInfoblock } from '../../catalog';
import { STAR_SUBSERVICES } from '../../catalog';
import type { Composition } from '../../composition';
import {
    allLtServiceCodes,
    ltPacketWeight,
    ltServiceCount,
    ltServiceSubtitle,
} from '../../composition';
import type { DocComplectGroup, DocGroupType, DocInfoblock } from '../model/dto';

/**
 * Группы наполнения для документа (легаси getDocumentInfoblocks): только
 * выбранные блоки, по группам с легаси-названиями и типами; регионы — в
 * группу НПА блоками `isRegion`; бесплатные isLa-архивы — в судебную
 * практику; ЭР/пакеты/LT/консалтинг/СТАР/академия — своими группами.
 * LT — сервисы наполнения и пакетов LT-other без повторов (легаси
 * handleLtByLtOther), Искра с подписью «(N×20 запросов в день)»; СТАР —
 * пакет и его подсервисы (легаси star.items).
 */

/** Группа каталога (init v2 / фикстура) → легаси-группа документа */
const GROUP_BY_CODE: Record<string, { type: DocGroupType; name: string }> = {
    npa: { type: 'npa', name: 'Нормативно-правовые акты' },
    sud: { type: 'la', name: 'Судебная практика' },
    la: { type: 'la', name: 'Судебная практика' },
    cons: { type: 'cons', name: 'Консультационные материалы' },
    c: { type: 'cons', name: 'Консультационные материалы' },
    spec: { type: 'sp', name: 'Специализированные блоки' },
    new: { type: 'sp', name: 'Новые блоки' },
    sp: { type: 'sp', name: 'Специализированные блоки' },
};
const GROUP_META: Record<DocGroupType, string> = {
    npa: 'Нормативно-правовые акты',
    la: 'Судебная практика',
    cons: 'Консультационные материалы',
    sp: 'Специализированные блоки',
    free: 'Бесплатные блоки',
    er: 'Энциклопедии решений',
    per: 'Пакеты энциклопедий решений',
    consulting: 'Правовой консалтинг',
    lt: 'Legal Tech',
    star: 'СТАР',
    academy: 'Академия Гарант',
};
const ORDER: DocGroupType[] = ['npa', 'la', 'cons', 'sp', 'free', 'er', 'per', 'consulting', 'lt', 'star', 'academy'];

const toDocInfoblock = (
    block: KInfoblock | undefined,
    code: string,
    overrides: Partial<DocInfoblock> = {},
): DocInfoblock => ({
    name: block?.name ?? code,
    title: block?.name ?? code,
    number: 0,
    code,
    checked: true,
    weight: block?.weight ?? 0,
    description: block?.description ?? null,
    isLa: block?.isLa ?? false,
    isRegion: false,
    subtitle: null,
    ...overrides,
});

export const buildComplectGroups = (
    catalog: Catalog,
    composition: Composition,
): DocComplectGroup[] => {
    const groups = new Map<DocGroupType, DocInfoblock[]>();
    const push = (type: DocGroupType, item: DocInfoblock) => {
        const list = groups.get(type) ?? [];
        list.push(item);
        groups.set(type, list);
    };

    for (const code of composition.infoblocks) {
        const block = catalog.infoblocks[code];
        const type = block ? (GROUP_BY_CODE[block.groupCode]?.type ?? 'sp') : 'sp';
        push(type, toDocInfoblock(block, code));
    }
    // регионы — рядом с «Региональным законодательством» в НПА (вес 0.5 каждый)
    for (const code of composition.regions) {
        const region = catalog.regions.byCode[code];
        push('npa', {
            name: region?.title ?? code,
            title: region?.infoblock ?? region?.title ?? code,
            number: 0,
            code,
            checked: true,
            weight: region?.weight ?? 0.5,
            description: region?.infoblock ?? null,
            isLa: false,
            isRegion: true,
            subtitle: null,
        });
    }
    for (const code of composition.freeBlocks) {
        const block = catalog.infoblocks[code];
        push(block?.isLa ? 'la' : 'free', toDocInfoblock(block, code));
    }
    for (const code of composition.ers) push('er', toDocInfoblock(catalog.infoblocks[code], code));
    for (const code of composition.erPackets) push('per', toDocInfoblock(catalog.infoblocks[code], code));

    const ltOf = (code: string) => catalog.services.lt.find(service => service.code === code);
    for (const code of allLtServiceCodes(composition)) {
        const service = ltOf(code);
        push('lt', {
            name: service?.name ?? code,
            title: service?.fullName ?? service?.name ?? code,
            number: 0,
            code,
            checked: true,
            weight: service?.weight ?? 1,
            description: null,
            isLa: false,
            isRegion: false,
            subtitle: ltServiceSubtitle(
                { code, name: service?.name ?? code },
                ltServiceCount(composition, code),
            ),
        });
    }
    const packetWeight = ltPacketWeight(composition, catalog);
    const ltPackage = catalog.services.ltPackages.find(pkg => pkg.weight === packetWeight);
    if (ltPackage) {
        push('lt', {
            name: ltPackage.name,
            title: ltPackage.fullName,
            number: 0,
            code: ltPackage.code,
            checked: true,
            weight: ltPackage.weight,
            description: null,
            isLa: false,
            isRegion: false,
            subtitle: null,
        });
    }

    const complect = catalog.complects.byCode[composition.complectCode];
    const consaltingCodes = [
        ...(complect?.withConsalting ? ['hotline'] : []),
        ...(composition.consalting ? [composition.consalting] : []),
    ];
    for (const code of consaltingCodes) {
        const service = catalog.services.consalting.find(item => item.code === code);
        if (!service) continue;
        push('consulting', {
            name: service.name,
            title: service.fullName || service.name,
            number: 0,
            code,
            checked: true,
            weight: service.weight,
            description: null,
            isLa: false,
            isRegion: false,
            subtitle: null,
        });
    }
    if (composition.star) {
        for (const service of catalog.services.star.length ? catalog.services.star : [null]) {
            push('star', {
                name: service?.name ?? 'СТАР',
                title: service?.fullName ?? 'СТАР',
                number: 0,
                code: service?.code ?? 'starpack',
                checked: true,
                weight: service?.weight ?? 0,
                description: null,
                isLa: false,
                isRegion: false,
                subtitle: null,
            });
        }
        // подсервисы СТАР — описание в КП, веса и цены не имеют
        for (const sub of STAR_SUBSERVICES) {
            push('star', {
                name: sub.name,
                title: sub.name,
                number: 0,
                code: sub.code,
                checked: true,
                weight: 0,
                description: sub.description,
                isLa: false,
                isRegion: false,
                subtitle: null,
            });
        }
    }
    if (composition.academy) {
        const pkg = catalog.academy.find(item => item.code === composition.academy);
        if (pkg) {
            push('academy', {
                name: pkg.name,
                title: pkg.name,
                number: 0,
                code: pkg.code,
                checked: true,
                weight: 0,
                description: null,
                isLa: false,
                isRegion: false,
                subtitle: null,
            });
        }
    }

    return ORDER.filter(type => groups.has(type)).map(type => ({
        groupsName: GROUP_META[type],
        type,
        value: groups.get(type) ?? [],
    }));
};
