import type { Provider } from '@/modules/entities/portal-provider';
import type { RqOption } from '../../model';

/**
 * Каждый поставщик портала несёт один набор реквизитов (rq); для выбора
 * нумератора нужны его id и человекочитаемое имя. Зеркалит нормализацию
 * из `ProviderPanel`.
 */
export function normalizeRqOptions(providers: Provider[]): RqOption[] {
    return providers.flatMap((provider, index) => {
        const id = provider.rq?.id ?? Number(provider.rqId);
        if (!Number.isFinite(id) || id <= 0) return [];
        const name =
            provider.name ||
            provider.rq?.name ||
            provider.rq?.shortname ||
            `Реквизиты ${index + 1}`;
        return [{ id, name }];
    });
}
