'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { LeadsFlowNodeData } from '../../constants/types';

const ACTOR_CLASSES: Record<string, string> = {
    sys: 'border-l-primary',
    mgr: 'border-l-muted-foreground/50',
    rop: 'border-l-warning',
};

type TaskNode = Node<LeadsFlowNodeData, 'task'>;

/** Узел-действие BPMN: карточка с цветовой полосой актора. */
export const TaskNode: React.FC<NodeProps<TaskNode>> = ({ data }) => (
    <div
        className={`w-52 rounded-lg border border-l-4 bg-card px-3 py-2 shadow-sm ${
            ACTOR_CLASSES[data.actor ?? 'sys']
        } ${data.tone === 'warn' ? 'bg-warning/10' : ''}`}
    >
        <Handle
            type="target"
            position={data.horizontal ? Position.Left : Position.Top}
            className="!bg-muted-foreground/60"
        />
        <p className="text-xs font-semibold leading-snug text-foreground">
            {data.label}
        </p>
        {data.sub && (
            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                {data.sub}
            </p>
        )}
        <Handle
            type="source"
            position={data.horizontal ? Position.Right : Position.Bottom}
            className="!bg-muted-foreground/60"
        />
    </div>
);
