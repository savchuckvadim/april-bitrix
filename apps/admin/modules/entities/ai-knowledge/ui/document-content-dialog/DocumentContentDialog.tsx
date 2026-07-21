'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Loader2 } from 'lucide-react';
import { useKnowledgeContent } from '../../lib/hooks/use-knowledge';
import { KnowledgeDocumentTarget } from '../../lib/types/knowledge.types';

interface DocumentContentDialogProps {
    /** Выбранный документ; null — диалог закрыт. */
    target: KnowledgeDocumentTarget | null;
    onClose: () => void;
}

/** Модалка с извлечённым текстом документа базы знаний. */
export function DocumentContentDialog({
    target,
    onClose,
}: DocumentContentDialogProps) {
    const { data, isLoading, error } = useKnowledgeContent(target);

    return (
        <Dialog
            open={target !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{target?.fileName}</DialogTitle>
                    <DialogDescription>
                        Тип: {target?.kind} · База:{' '}
                        {target?.domain ?? 'общая'}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : error ? (
                    <p className="text-sm text-red-600">
                        Не удалось получить текст: {error.message}
                    </p>
                ) : (
                    <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-md bg-muted p-4 font-sans text-sm">
                        {data?.text || 'Текст не извлечён'}
                    </pre>
                )}

                <DialogFooter>
                    <Button onClick={onClose}>Закрыть</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
