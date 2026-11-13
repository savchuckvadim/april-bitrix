'use client';

import { Check, Download } from 'lucide-react';
import { GlassDialog } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import type { WordTemplateSummary } from '@/modules/entities/offer-template-word';
import { TemplateCardPreview } from './TemplateCardPreview';

export interface TemplatePreviewDialogProps {
    template: WordTemplateSummary | null;
    selected: boolean;
    previewVersion: number;
    onSelect: () => void;
    onDownload: () => void;
    onClose: () => void;
}

/** Превью крупно: первая страница на примере «Гарант-Офис», выбор и скачивание. */
export const TemplatePreviewDialog = ({
    template,
    selected,
    previewVersion,
    onSelect,
    onDownload,
    onClose,
}: TemplatePreviewDialogProps) => (
    <GlassDialog
        open={Boolean(template)}
        onOpenChange={next => (next ? undefined : onClose())}
        size="lg"
        intensity="soft"
        cardClassName="max-h-[92vh] gap-4 overflow-hidden"
    >
        <DialogHeader>
            <DialogTitle>{template?.name}</DialogTitle>
            <DialogDescription>
                Первая страница КП на примере комплекта «Гарант-Офис» — данные вымышленные.
            </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto rounded-lg border">
            {template ? <TemplateCardPreview templateId={String(template.id)} version={previewVersion} /> : null}
        </div>
        <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onDownload}>
                <Download aria-hidden />
                Скачать DOCX
            </Button>
            <Button
                disabled={selected}
                onClick={() => {
                    onSelect();
                    onClose();
                }}
            >
                {selected ? <Check aria-hidden /> : null}
                {selected ? 'Выбран' : 'Выбрать для КП'}
            </Button>
        </DialogFooter>
    </GlassDialog>
);
