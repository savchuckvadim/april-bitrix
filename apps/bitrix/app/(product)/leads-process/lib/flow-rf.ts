import { MarkerType } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import {
    LeadsFlowEdgeDef,
    LeadsFlowNodeData,
    LeadsFlowNodeDef,
} from '../constants/types';

export const EDGE_LABEL_STYLE = { fontSize: 10 };

/** Стиль линии ребра: пунктир — редкий/исключительный путь. */
export const edgeStrokeStyle = (dashed?: boolean) =>
    dashed ? { strokeDasharray: '6 4' } : undefined;

/** Дефы узлов схемы → узлы React Flow. */
export const buildFlowNodes = (defs: LeadsFlowNodeDef[]): Node[] =>
    defs.map((def) => ({
        id: def.id,
        type: def.kind,
        position: def.position,
        data: def.data,
    }));

/** Дефы рёбер схемы → рёбра React Flow. */
export const buildFlowEdges = (defs: LeadsFlowEdgeDef[]): Edge[] =>
    defs.map((def, index) => ({
        id: `${def.source}-${def.target}-${index}`,
        source: def.source,
        target: def.target,
        label: def.label,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { dashed: def.dashed },
        style: edgeStrokeStyle(def.dashed),
        labelStyle: EDGE_LABEL_STYLE,
    }));

/** Узлы React Flow → дефы (для сохранения варианта). */
export const toNodeDefs = (nodes: Node[]): LeadsFlowNodeDef[] =>
    nodes.map((node) => ({
        id: node.id,
        kind: (node.type ?? 'task') as LeadsFlowNodeDef['kind'],
        position: { x: node.position.x, y: node.position.y },
        data: node.data as LeadsFlowNodeData,
    }));

/** Рёбра React Flow → дефы (для сохранения варианта). */
export const toEdgeDefs = (edges: Edge[]): LeadsFlowEdgeDef[] =>
    edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        label: typeof edge.label === 'string' ? edge.label : undefined,
        dashed:
            (edge.data as { dashed?: boolean } | undefined)?.dashed ||
            undefined,
    }));
