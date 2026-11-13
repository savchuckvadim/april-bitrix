'use client';

import { GlassDialog } from '@workspace/april-ui';
import { DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import {
    WordTemplateForm,
    type CreateWordTemplateRequest,
    type UpdateWordTemplateRequest,
    type WordTemplateSummary,
} from '@/modules/entities/offer-template-word';

export interface TemplateFormDialogProps {
    open: boolean;
    editing: WordTemplateSummary | null;
    isSuperUser: boolean;
    isSaving: boolean;
    onSubmit: (data: CreateWordTemplateRequest | UpdateWordTemplateRequest) => Promise<void>;
    onClose: () => void;
}

/** Загрузка нового шаблона или правка существующего — окном поверх витрины. */
export const TemplateFormDialog = ({ open, editing, isSuperUser, isSaving, onSubmit, onClose }: TemplateFormDialogProps) => (
    <GlassDialog
        open={open}
        onOpenChange={next => (next ? undefined : onClose())}
        size="lg"
        intensity="soft"
        cardClassName="max-h-[88vh] gap-4 overflow-y-auto"
    >
        <DialogHeader>
            <DialogTitle>{editing ? `Шаблон «${editing.name}»` : 'Новый шаблон КП'}</DialogTitle>
        </DialogHeader>
        {open ? (
            <WordTemplateForm
                editingTemplate={editing}
                isSuperUser={isSuperUser}
                onSubmit={onSubmit}
                onCancel={onClose}
                isLoading={isSaving}
            />
        ) : null}
    </GlassDialog>
);
