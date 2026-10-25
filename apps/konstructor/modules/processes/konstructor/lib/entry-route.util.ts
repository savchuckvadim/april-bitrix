import { ROUTE_KONSTRUCTOR } from '@/modules/shared/lib/routing';

type LoadStatus = 'idle' | 'loading' | 'done' | 'failed';

export interface EntryInput {
    dealId: number | null;
    catalog: LoadStatus;
    /** Восстановление слепка сделки. */
    snapshot: 'idle' | 'loading' | 'restored' | 'none' | 'error';
    portal: LoadStatus;
    /** На портале установлен смарт «Варианты комплекта». */
    hasVariantSmart: boolean;
    variants: LoadStatus;
    variantsCount: number;
}

/** Куда вести со входа; `wait` — данных для решения ещё нет. */
export type EntryTarget =
    | 'wait'
    | 'catalog-failed'
    | ROUTE_KONSTRUCTOR.START
    | ROUTE_KONSTRUCTOR.VARIANTS
    | ROUTE_KONSTRUCTOR.DOCUMENT;

const isPending = (status: LoadStatus) =>
    status === 'idle' || status === 'loading';

/**
 * Решение на входе (docs/routing.md §1):
 * - сделки нет или слепка нет → старт (Избранное · Акции · Создать);
 * - у сделки есть варианты КП → выбор варианта;
 * - слепок восстановлен → хаб документов.
 *
 * Без каталога не работает ни один экран — это отдельный исход, а не старт.
 * Упавшие портал или список вариантов не блокируют вход: конструктор
 * работает и без смарта вариантов.
 */
export const resolveEntryTarget = (input: EntryInput): EntryTarget => {
    if (input.catalog === 'failed') return 'catalog-failed';
    if (isPending(input.catalog)) return 'wait';
    if (!input.dealId) return ROUTE_KONSTRUCTOR.START;

    if (input.snapshot === 'idle' || input.snapshot === 'loading') return 'wait';
    if (isPending(input.portal)) return 'wait';
    if (input.hasVariantSmart && isPending(input.variants)) return 'wait';

    if (input.variants === 'done' && input.variantsCount > 0) {
        return ROUTE_KONSTRUCTOR.VARIANTS;
    }
    return input.snapshot === 'restored'
        ? ROUTE_KONSTRUCTOR.DOCUMENT
        : ROUTE_KONSTRUCTOR.START;
};
