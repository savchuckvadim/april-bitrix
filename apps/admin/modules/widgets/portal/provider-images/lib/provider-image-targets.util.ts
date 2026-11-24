/** Что нужно от поставщика, чтобы показать его реквизиты в списке картинок. */
export interface ProviderImageTargetSource {
    name?: string | null;
    rqId?: string | number | null;
    rq?: {
        id?: number | null;
        name?: string | null;
        shortname?: string | null;
        type?: string | null;
        inn?: string | null;
    } | null;
}

/** Реквизиты поставщика для карточки списка: у каждых своя секция картинок. */
export interface ProviderImageTarget {
    rqId: number;
    title: string;
    /** Тип реквизитов и ИНН через « · »; пусто, если показать нечего */
    subtitle: string;
}

const filled = (value: string | null | undefined): string | null => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

/** id реквизитов: из вложенного `rq`, иначе из `rqId` поставщика; null, если id нет. */
function resolveRqId(provider: ProviderImageTargetSource): number | null {
    const id = provider.rq?.id ?? Number(provider.rqId);
    return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Реквизиты всех поставщиков портала для страницы картинок. Поставщик без id
 * реквизитов пропускается: картинки привязаны к реквизитам. Один набор
 * реквизитов показывается один раз. Название — поставщик, затем название
 * набора, затем краткое наименование.
 */
export function buildProviderImageTargets(
    providers: readonly ProviderImageTargetSource[],
): ProviderImageTarget[] {
    const seen = new Set<number>();
    const targets: ProviderImageTarget[] = [];

    for (const provider of providers) {
        const rqId = resolveRqId(provider);
        if (rqId === null || seen.has(rqId)) continue;
        seen.add(rqId);

        const title =
            filled(provider.name) ??
            filled(provider.rq?.name) ??
            filled(provider.rq?.shortname) ??
            `Реквизиты №${rqId}`;
        const inn = filled(provider.rq?.inn);
        const subtitle = [filled(provider.rq?.type), inn ? `ИНН ${inn}` : null]
            .filter((part): part is string => part !== null)
            .join(' · ');

        targets.push({ rqId, title, subtitle });
    }

    return targets;
}
