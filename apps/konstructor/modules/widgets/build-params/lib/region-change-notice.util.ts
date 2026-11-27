import type { Catalog } from '@/modules/entities/catalog';

/**
 * Подсказка менеджеру после смены региона клиента: региональное
 * законодательство в наполнении строк переехало на новый регион.
 */
export const buildRegionChangeNotice = (catalog: Catalog, from: string, to: string): string => {
    const fromTitle = catalog.regions.byCode[from]?.title ?? from;
    const toTitle = catalog.regions.byCode[to]?.title ?? to;
    return `Регион клиента изменён: «${fromTitle}» заменён на «${toTitle}». Региональное законодательство в наполнении обновлено.`;
};
