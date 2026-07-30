'use client';

import React, { useMemo } from 'react';
import {
    Background,
    BackgroundVariant,
    Controls,
    ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LeadsFlowDef } from '../../constants/types';
import { buildFlowEdges, buildFlowNodes } from '../../lib/flow-rf';
import { useFlowFullscreen } from '../../hooks/use-flow-fullscreen';
import { NODE_TYPES } from './node-types';
import { FlowFrame } from './FlowFrame';

export interface ProcessFlowProps {
    flow: LeadsFlowDef;
}

/**
 * Канвас-схема процесса на React Flow: read-only, зум и панорамирование
 * через контролы; кнопкой разворачивается в полноценный fullscreen.
 */
export const ProcessFlow: React.FC<ProcessFlowProps> = ({ flow }) => {
    const { isFullscreen, toggle } = useFlowFullscreen();
    const nodes = useMemo(() => buildFlowNodes(flow.nodes), [flow.nodes]);
    const edges = useMemo(() => buildFlowEdges(flow.edges), [flow.edges]);

    return (
        <FlowFrame
            height={flow.height}
            title={flow.title}
            caption={flow.caption}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggle}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={NODE_TYPES}
                fitView
                fitViewOptions={{ padding: 0.08 }}
                minZoom={0.3}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={isFullscreen}
                preventScrolling={isFullscreen}
                panOnDrag
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={18}
                    size={1}
                />
                <Controls showInteractive={false} />
            </ReactFlow>
        </FlowFrame>
    );
};
