import type { ContractSpecificationItem } from '@/modules/entities/contract-document';

/** Раздел подробностей спецификации (легаси «Развернуть»). */
export interface SpecificationSection {
    key: SpecificationSectionKey;
    title: string;
    items: ContractSpecificationItem[];
}

export type SpecificationSectionKey =
    | 'iblocks'
    | 'ers'
    | 'lt-free'
    | 'lt-paid'
    | 'services'
    | 'consalting'
    | 'supply';

/** Пакет Legal Tech для показа: подпись строки, название пакета, сервисы. */
export interface LtPacketView {
    key: string;
    label: string;
    name: string;
    services: string[];
}

const IBLOCK_CODES = new Set([
    'specification_iblocks',
    'specification_ibig',
    'specification_ismall',
    'specification_ifree',
]);

const LT_PAID = /^specification_lt_(?:packet|services)(?:_[0-9]+)?$/;
const LT_HEAD = /^specification_lt_(?:free|packet(?:_[0-9]+)?)$/;

/** Порядок разделов и правило попадания строки по коду; остальное — «Поставка». */
const SECTION_RULES: Array<{
    key: SpecificationSectionKey;
    title: string;
    test: (code: string) => boolean;
}> = [
    { key: 'iblocks', title: 'Информационные блоки', test: code => IBLOCK_CODES.has(code) },
    { key: 'ers', title: 'Энциклопедии решений', test: code => code.startsWith('specification_ers') },
    { key: 'lt-free', title: 'Legal Tech в комплекте', test: code => code.startsWith('specification_lt_free') },
    { key: 'lt-paid', title: 'Legal Tech платный', test: code => LT_PAID.test(code) },
    { key: 'services', title: 'Другие сервисы', test: code => code === 'specification_services' },
    { key: 'consalting', title: 'Консалтинг', test: code => code.startsWith('specification_pk') },
    { key: 'supply', title: 'Поставка', test: () => true },
];

/** Текст значения строки спецификации: строка как есть, остальное — пусто. */
export const specificationText = (item: ContractSpecificationItem): string =>
    typeof item.value === 'string' ? item.value : '';

/** Высота текстового поля по числу строк значения: от 2 до 6. */
export const specificationRows = (value: string): number =>
    Math.min(6, Math.max(2, value.split('\n').length));

/** Скрытые строки спецификации по разделам, в порядке SECTION_RULES. */
export const groupSpecificationDetails = (
    items: ContractSpecificationItem[],
): SpecificationSection[] => {
    const sections = new Map<SpecificationSectionKey, SpecificationSection>();
    for (const item of items) {
        const rule = SECTION_RULES.find(entry => entry.test(item.code))!;
        const section = sections.get(rule.key) ?? { key: rule.key, title: rule.title, items: [] };
        section.items.push(item);
        sections.set(rule.key, section);
    }
    return SECTION_RULES.flatMap(rule => sections.get(rule.key) ?? []);
};

/** Раздел Legal Tech: строки только для чтения, показываем пакетами. */
export const isLtSection = (key: SpecificationSectionKey): boolean =>
    key === 'lt-free' || key === 'lt-paid';

/**
 * Строки Legal Tech → пакеты: строка названия открывает пакет, строка состава
 * дополняет последний. Бэк шлёт их парами по порядку.
 */
export const ltPacketsOf = (items: ContractSpecificationItem[]): LtPacketView[] => {
    const packets: LtPacketView[] = [];
    for (const item of items) {
        const text = specificationText(item).trim();
        if (LT_HEAD.test(item.code)) {
            packets.push({ key: item.code, label: item.name, name: text, services: [] });
        } else if (packets.length) {
            const services = text
                .split('\n')
                .map(service => service.trim())
                .filter(Boolean);
            packets[packets.length - 1]!.services.push(...services);
        }
    }
    return packets.filter(packet => packet.name || packet.services.length);
};
