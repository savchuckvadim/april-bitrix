import { describe, expect, it } from 'vitest';
import { resolveEntryTarget, type EntryInput } from '../entry-route.util';
import { ROUTE_KONSTRUCTOR } from '@/modules/shared/lib/routing';

const ready: EntryInput = {
    dealId: 129487,
    catalog: 'done',
    snapshot: 'restored',
    portal: 'done',
    hasVariantSmart: true,
    variants: 'done',
    variantsCount: 0,
};

describe('resolveEntryTarget', () => {
    it('без каталога — отдельный исход, а не старт', () => {
        expect(resolveEntryTarget({ ...ready, catalog: 'failed' })).toBe(
            'catalog-failed',
        );
        expect(resolveEntryTarget({ ...ready, catalog: 'loading' })).toBe('wait');
    });

    it('сделки нет — сразу старт, слепок не ждём', () => {
        expect(
            resolveEntryTarget({ ...ready, dealId: null, snapshot: 'idle' }),
        ).toBe(ROUTE_KONSTRUCTOR.START);
    });

    it('ждёт слепок, портал и варианты', () => {
        expect(resolveEntryTarget({ ...ready, snapshot: 'loading' })).toBe('wait');
        expect(resolveEntryTarget({ ...ready, portal: 'idle' })).toBe('wait');
        expect(resolveEntryTarget({ ...ready, variants: 'loading' })).toBe(
            'wait',
        );
    });

    it('есть варианты КП — выбор варианта, даже при восстановленном слепке', () => {
        expect(resolveEntryTarget({ ...ready, variantsCount: 2 })).toBe(
            ROUTE_KONSTRUCTOR.VARIANTS,
        );
    });

    it('слепок восстановлен, вариантов нет — хаб документов', () => {
        expect(resolveEntryTarget(ready)).toBe(ROUTE_KONSTRUCTOR.DOCUMENT);
    });

    it('слепка нет — старт', () => {
        expect(resolveEntryTarget({ ...ready, snapshot: 'none' })).toBe(
            ROUTE_KONSTRUCTOR.START,
        );
        expect(resolveEntryTarget({ ...ready, snapshot: 'error' })).toBe(
            ROUTE_KONSTRUCTOR.START,
        );
    });

    it('смарта вариантов нет или портал упал — варианты не ждём', () => {
        expect(
            resolveEntryTarget({
                ...ready,
                hasVariantSmart: false,
                variants: 'idle',
            }),
        ).toBe(ROUTE_KONSTRUCTOR.DOCUMENT);
        expect(
            resolveEntryTarget({
                ...ready,
                portal: 'failed',
                hasVariantSmart: false,
                variants: 'idle',
            }),
        ).toBe(ROUTE_KONSTRUCTOR.DOCUMENT);
    });

    it('список вариантов не загрузился — вход не блокируется', () => {
        expect(
            resolveEntryTarget({ ...ready, variants: 'failed', variantsCount: 0 }),
        ).toBe(ROUTE_KONSTRUCTOR.DOCUMENT);
    });
});
