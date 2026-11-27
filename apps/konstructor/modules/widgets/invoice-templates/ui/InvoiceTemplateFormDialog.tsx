'use client';

import { GlassDialog } from '@workspace/april-ui';
import { DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import type {
    InvoiceTemplate,
    InvoiceTemplateCreateInput,
    InvoiceTemplateQuota,
    InvoiceTemplateUpdateInput,
} from '@/modules/entities/invoice-template';
import { InvoiceTemplateForm } from './InvoiceTemplateForm';

export interface InvoiceTemplateFormDialogProps {
    open: boolean;
    /** Правимый шаблон; `null` при создании. */
    editing: InvoiceTemplate | null;
    quota: InvoiceTemplateQuota;
    isSaving: boolean;
    onCreate: (input: InvoiceTemplateCreateInput) => Promise<boolean>;
    onUpdate: (id: string, input: InvoiceTemplateUpdateInput) => Promise<boolean>;
    onClose: () => void;
}

/** Добавление и правка шаблона счёта окном поверх списка. */
export const InvoiceTemplateFormDialog = ({
    open,
    editing,
    quota,
    isSaving,
    onCreate,
    onUpdate,
    onClose,
}: InvoiceTemplateFormDialogProps) => (
    <GlassDialog
        open={open}
        onOpenChange={next => (next ? undefined : onClose())}
        size="md"
        intensity="soft"
        cardClassName="max-h-[88vh] gap-4 overflow-y-auto"
    >
        <DialogHeader>
            <DialogTitle>
                {editing ? `Шаблон счёта «${editing.name}»` : 'Новый шаблон счёта'}
            </DialogTitle>
        </DialogHeader>
        {open ? (
            <InvoiceTemplateForm
                key={editing?.id ?? 'new'}
                editing={editing}
                quota={quota}
                isSaving={isSaving}
                onCreate={onCreate}
                onUpdate={onUpdate}
                onSaved={onClose}
                onCancel={onClose}
            />
        ) : null}
    </GlassDialog>
);
