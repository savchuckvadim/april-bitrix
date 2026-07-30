'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { PenLine } from 'lucide-react';
import { LeadsFlowDef } from '../../constants/types';
import { useFlowBlockEditor } from '../../hooks/use-flow-block-editor';
import { ProcessFlowLazy, FlowEditorLazy } from './lazy';

interface FlowBlockProps {
    flow: LeadsFlowDef;
}

/**
 * Блок схемы: оригинал + «Создать свой вариант» — редактируемая копия
 * под оригиналом. Сохранённый вариант открывается автоматически.
 */
export const FlowBlock: React.FC<FlowBlockProps> = ({ flow }) => {
    const { isEditorOpen, openEditor, closeEditor } = useFlowBlockEditor(
        flow.id,
    );

    return (
        <div className="space-y-3">
            <ProcessFlowLazy flow={flow} />
            {isEditorOpen ? (
                <>
                    <p className="text-xs text-muted-foreground">
                        Ваш вариант: двигайте узлы, тяните связи от точек,
                        выберите элемент — появится панель подписей. Delete —
                        удалить выбранное. Правки сохраняются в браузере и
                        приложатся PNG к протоколу листа решений.
                    </p>
                    <FlowEditorLazy flow={flow} onRemoved={closeEditor} />
                </>
            ) : (
                <Button variant="outline" size="sm" onClick={openEditor}>
                    <PenLine className="mr-1.5 h-3.5 w-3.5" />
                    Создать свой вариант
                </Button>
            )}
        </div>
    );
};
