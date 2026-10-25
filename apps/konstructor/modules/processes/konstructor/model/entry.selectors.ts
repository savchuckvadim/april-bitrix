import type { RootState } from '@/modules/app';
import { getComplectVariantPbxSmartEntityId } from '@/modules/entities/portal';
import {
    resolveEntryTarget,
    type EntryInput,
    type EntryTarget,
} from '../lib/entry-route.util';

/** Статусы загрузки разных слайсов → единый язык решения на входе. */
const LOAD_STATUS: Record<string, EntryInput['catalog']> = {
    idle: 'idle',
    pending: 'loading',
    loading: 'loading',
    succeeded: 'done',
    ready: 'done',
    failed: 'failed',
    error: 'failed',
};

/** Строка-исход, а не объект: селектор стабилен и не дёргает перерисовки. */
export const selectEntryTarget = (state: RootState): EntryTarget =>
    resolveEntryTarget({
        dealId: state.app.dealId,
        catalog: LOAD_STATUS[state.catalog.loading] ?? 'idle',
        snapshot: state.snapshot.status,
        portal: LOAD_STATUS[state.portal.status] ?? 'idle',
        hasVariantSmart: Boolean(
            getComplectVariantPbxSmartEntityId(state.portal.current),
        ),
        variants: LOAD_STATUS[state.complectVariant.status] ?? 'idle',
        variantsCount: state.complectVariant.records.length,
    });
