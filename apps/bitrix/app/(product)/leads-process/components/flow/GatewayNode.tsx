'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { LeadsFlowNodeData } from '../../constants/types';

type GatewayNode = Node<LeadsFlowNodeData, 'gateway'>;

/** Узел-развилка BPMN: ромб с вопросом. */
export const GatewayNode: React.FC<NodeProps<GatewayNode>> = ({ data }) => (
    <div className="relative flex h-24 w-40 items-center justify-center">
        <Handle
            type="target"
            position={data.horizontal ? Position.Left : Position.Top}
            className="!bg-muted-foreground/60"
        />
        <div className="absolute h-14 w-14 rotate-45 rounded-sm border-2 border-warning bg-card shadow-sm" />
        <p className="relative z-10 max-w-36 text-center text-[10px] font-semibold leading-tight text-foreground">
            {data.label}
        </p>
        <Handle
            type="source"
            position={data.horizontal ? Position.Right : Position.Bottom}
            className="!bg-muted-foreground/60"
        />
    </div>
);
