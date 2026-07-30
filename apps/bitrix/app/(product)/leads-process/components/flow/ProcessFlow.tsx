'use client';

import React, { useMemo } from 'react';
import {
    Background,
    BackgroundVariant,
    Controls,
    MarkerType,
    ReactFlow,
} from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LeadsFlowDef } from '../../constants/types';
import { TaskNode } from './TaskNode';
import { GatewayNode } from './GatewayNode';
import { EventNode } from './EventNode';

const NODE_TYPES = {
    task: TaskNode,
    gateway: GatewayNode,
    event: EventNode,
};

export interface ProcessFlowProps {
    flow: LeadsFlowDef;
}

/**
 * Канвас-схема процесса на React Flow: read-only, зум и панорамирование
 * через контролы, страница при этом скроллится свободно.
 */
export const ProcessFlow: React.FC<ProcessFlowProps> = ({ flow }) => {
    const nodes = useMemo<Node[]>(
        () =>
            flow.nodes.map((def) => ({
                id: def.id,
                type: def.kind,
                position: def.position,
                data: def.data,
                draggable: false,
            })),
        [flow.nodes],
    );

    const edges = useMemo<Edge[]>(
        () =>
            flow.edges.map((def, index) => ({
                id: `${def.source}-${def.target}-${index}`,
                source: def.source,
                target: def.target,
                label: def.label,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
                style: def.dashed ? { strokeDasharray: '6 4' } : undefined,
                labelStyle: { fontSize: 10 },
            })),
        [flow.edges],
    );

    return (
        <figure className="rounded-xl border bg-card">
            <div style={{ height: flow.height }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={NODE_TYPES}
                    fitView
                    fitViewOptions={{ padding: 0.08 }}
                    minZoom={0.3}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    zoomOnScroll={false}
                    preventScrolling={false}
                    panOnDrag
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={18}
                        size={1}
                    />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </div>
            {flow.caption && (
                <figcaption className="border-t px-4 py-2.5 text-sm text-muted-foreground">
                    {flow.caption}
                </figcaption>
            )}
        </figure>
    );
};
