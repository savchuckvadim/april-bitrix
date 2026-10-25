import type { StatusTone } from '@workspace/april-ui/tones';
import {
    COMPLECT_VARIANT_STAGE,
    type ComplectVariantStage,
} from '@/modules/entities/complect-variant';

/** Цвет бэйджа стадии варианта: участвует / черновик / слит / отклонён. */
export const VARIANT_STAGE_TONE: Record<ComplectVariantStage, StatusTone> = {
    [COMPLECT_VARIANT_STAGE.draft]: 'muted',
    [COMPLECT_VARIANT_STAGE.current]: 'success',
    [COMPLECT_VARIANT_STAGE.merged]: 'info',
    [COMPLECT_VARIANT_STAGE.rejected]: 'destructive',
};
