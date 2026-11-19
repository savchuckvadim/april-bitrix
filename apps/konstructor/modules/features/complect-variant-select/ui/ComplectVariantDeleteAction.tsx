'use client';

import { Trash2 } from 'lucide-react';
import { HintTooltip } from '@workspace/april-ui';
import { IconAction } from '@workspace/april-ui/actions';
import {
    VARIANT_DELETE_BLOCKED_HINT,
    type ComplectVariantRecordDto,
} from '@/modules/entities/complect-variant';
import type { ComplectVariantsState } from '../hooks/use-complect-variants';
import { useVariantDelete } from '../hooks/use-variant-delete';
import { ComplectVariantDeleteDialog } from './ComplectVariantDeleteDialog';

export interface ComplectVariantDeleteActionProps {
    record: ComplectVariantRecordDto;
    variants: ComplectVariantsState;
}

/**
 * Кнопка «Удалить вариант» с подтверждением. У варианта, открытого в
 * редакторе, кнопка недоступна: подсказка просит сначала его закрыть.
 * Подсказку держит обёртка: у выключенной кнопки событий мыши нет.
 */
export const ComplectVariantDeleteAction = ({
    record,
    variants,
}: ComplectVariantDeleteActionProps) => {
    const deletion = useVariantDelete(record, variants);

    if (record.variantSmartId === null) return null;

    return (
        <>
            {deletion.deletable ? (
                <IconAction
                    icon={Trash2}
                    label="Удалить вариант"
                    hint="Вариант и его элемент в Битриксе удаляются насовсем"
                    disabled={variants.isBusy}
                    onClick={deletion.askConfirm}
                    className="hover:text-destructive"
                />
            ) : (
                <HintTooltip title={VARIANT_DELETE_BLOCKED_HINT} align="end">
                    <span className="inline-flex" tabIndex={0}>
                        <IconAction icon={Trash2} label="Удалить вариант" disabled />
                    </span>
                </HintTooltip>
            )}
            <ComplectVariantDeleteDialog
                open={deletion.confirming}
                title={deletion.title}
                onConfirm={() => void deletion.confirm()}
                onCancel={deletion.cancel}
            />
        </>
    );
};
