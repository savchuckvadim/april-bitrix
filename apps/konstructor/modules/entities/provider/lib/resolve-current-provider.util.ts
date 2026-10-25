import type { Provider } from '../model/dto';

/**
 * Какой поставщик выбран (порядок — как в легаси `resolveCurrentProviderThunk`):
 * 1. тот, что записан в сделке (поле `document_provider` хранит НАЗВАНИЕ);
 * 2. ранее выбранный (id из настроек пользователя или текущего состояния);
 * 3. первый в списке.
 */
export const resolveCurrentProvider = (
    providers: Provider[],
    dealProviderName: string | null,
    preferredId: string | null,
): Provider | null => {
    const byDeal = dealProviderName
        ? providers.find(provider => provider.name === dealProviderName)
        : undefined;
    if (byDeal) return byDeal;

    const preferred = preferredId
        ? providers.find(provider => provider.id === preferredId)
        : undefined;
    return preferred ?? providers[0] ?? null;
};
