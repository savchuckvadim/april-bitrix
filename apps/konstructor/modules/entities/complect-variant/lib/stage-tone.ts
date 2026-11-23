import type { StatusTone } from '@workspace/april-ui/tones';
import { COMPLECT_VARIANT_STAGE, type ComplectVariantStage } from './stage';

/**
 * Цвет бейджа стадии варианта: черновик приглушён, «Текущий» и «Успех»
 * зелёные, рабочие стадии (мердж, КП, счёт, договор, поставка, согласование)
 * информационные, «Отклонён» и «Не состоялся» красные.
 */
export const COMPLECT_VARIANT_STAGE_TONE: Record<ComplectVariantStage, StatusTone> = {
    [COMPLECT_VARIANT_STAGE.draft]: 'muted',
    [COMPLECT_VARIANT_STAGE.current]: 'success',
    [COMPLECT_VARIANT_STAGE.merged]: 'info',
    [COMPLECT_VARIANT_STAGE.offer]: 'info',
    [COMPLECT_VARIANT_STAGE.invoice]: 'info',
    [COMPLECT_VARIANT_STAGE.contract]: 'info',
    [COMPLECT_VARIANT_STAGE.supply]: 'info',
    [COMPLECT_VARIANT_STAGE.approval]: 'info',
    [COMPLECT_VARIANT_STAGE.success]: 'success',
    [COMPLECT_VARIANT_STAGE.rejected]: 'destructive',
    [COMPLECT_VARIANT_STAGE.failed]: 'destructive',
};
