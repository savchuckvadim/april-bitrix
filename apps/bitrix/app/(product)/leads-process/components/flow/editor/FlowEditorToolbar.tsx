'use client';

import React from 'react';
import { Panel } from '@xyflow/react';
import { Button } from '@workspace/ui/components/button';
import { Circle, Diamond, SquarePlus } from 'lucide-react';
import { LeadsFlowNodeDef } from '../../../constants/types';

interface FlowEditorToolbarProps {
    onAddNode: (kind: LeadsFlowNodeDef['kind']) => void;
}

/** Панель добавления узлов в левом верхнем углу канваса-редактора. */
export const FlowEditorToolbar: React.FC<FlowEditorToolbarProps> = ({
    onAddNode,
}) => (
    <Panel position="top-left" className="nopan flex flex-wrap gap-1">
        <Button
            variant="outline"
            size="sm"
            onClick={() => onAddNode('task')}
            title="Добавить шаг процесса"
        >
            <SquarePlus className="mr-1 h-3.5 w-3.5" />
            Шаг
        </Button>
        <Button
            variant="outline"
            size="sm"
            onClick={() => onAddNode('gateway')}
            title="Добавить развилку-условие"
        >
            <Diamond className="mr-1 h-3.5 w-3.5" />
            Условие
        </Button>
        <Button
            variant="outline"
            size="sm"
            onClick={() => onAddNode('event')}
            title="Добавить событие (старт/итог)"
        >
            <Circle className="mr-1 h-3.5 w-3.5" />
            Событие
        </Button>
    </Panel>
);
