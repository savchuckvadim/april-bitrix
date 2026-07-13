import type { Provider } from '@/modules/entities/portal-provider';
import type { RqOption } from '../../model';

const toNum = (v: unknown): number | null =>
    typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || null : null;

/**
 * Ответы бэка по поставщику слабо типизированы (`{ [key: string]: unknown }`).
 * Каждый поставщик портала несёт один набор реквизитов (Rq); извлекаем из него
 * id и человекочитаемое имя для выбора нумератора. Зеркалит логику нормализации
 * из `ProviderPanel`.
 */
export function normalizeRqOptions(providers: Provider[]): RqOption[] {
    const options: RqOption[] = [];

    providers.forEach((raw, index) => {
        const p = raw as Record<string, unknown>;
        const nested =
            p.rq && typeof p.rq === 'object'
                ? (p.rq as Record<string, unknown>)
                : null;
        const rq = nested ?? p;

        const id = toNum(nested?.id ?? p.rqId ?? p.id);
        if (id == null) return;

        const name =
            (typeof p.name === 'string' && p.name) ||
            (typeof rq.name === 'string' && (rq.name as string)) ||
            (typeof rq.shortname === 'string' && (rq.shortname as string)) ||
            `Реквизиты ${index + 1}`;

        options.push({ id, name });
    });

    return options;
}
