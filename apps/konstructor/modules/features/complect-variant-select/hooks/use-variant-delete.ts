'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    describeVariantDeleteResult,
    type ComplectVariantRecordDto,
} from '@/modules/entities/complect-variant';
import type { ComplectVariantsState } from './use-complect-variants';

/**
 * Удаление одного варианта: окно подтверждения и уведомление по итогу.
 * Само удаление и его порядок живут в thunk слайса; здесь только то, что
 * видит менеджер.
 */
export const useVariantDelete = (
    record: ComplectVariantRecordDto,
    variants: ComplectVariantsState,
) => {
    const [confirming, setConfirming] = useState(false);
    const variantSmartId = record.variantSmartId;
    const title = variants.titleOf(record);

    const confirm = async () => {
        if (variantSmartId === null) return;
        // окно закрываем до запроса: после удаления строка уйдёт из списка
        setConfirming(false);
        const result = await variants.remove(variantSmartId);
        const notice = describeVariantDeleteResult(result, title);
        if (notice.kind === 'success') {
            toast.success(notice.text);
            return;
        }
        toast.error(notice.text, { duration: notice.durationMs });
    };

    return {
        title,
        /** false у открытого в редакторе варианта: кнопка недоступна с подсказкой */
        deletable: variants.canDelete(variantSmartId),
        confirming,
        askConfirm: () => setConfirming(true),
        cancel: () => setConfirming(false),
        confirm,
    };
};
