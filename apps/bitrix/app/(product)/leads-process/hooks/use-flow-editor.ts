'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    addEdge,
    MarkerType,
    useEdgesState,
    useNodesState,
} from '@xyflow/react';
import type { Connection, Edge, Node, OnSelectionChangeParams } from '@xyflow/react';
import {
    LeadsFlowDef,
    LeadsFlowNodeData,
    LeadsFlowNodeDef,
} from '../constants/types';
import {
    buildFlowEdges,
    buildFlowNodes,
    EDGE_LABEL_STYLE,
    edgeStrokeStyle,
    toEdgeDefs,
    toNodeDefs,
} from '../lib/flow-rf';
import {
    loadFlowVariant,
    removeFlowVariant,
    saveFlowVariant,
} from '../lib/flow-variant-storage';
import { registerFlowExport } from '../lib/flow-export-registry';
import { exportFlowPng, variantFileName } from '../lib/flow-export';
import { downloadDataUrl } from '../../how-we-work/lib/build-protocol';

const AUTOSAVE_DELAY_MS = 500;

const NEW_NODE_DATA: Record<LeadsFlowNodeDef['kind'], LeadsFlowNodeData> = {
    task: { label: 'Новый шаг', sub: 'опишите действие' },
    gateway: { label: 'Условие?' },
    event: { label: 'Событие', tone: 'start' },
};

/**
 * Состояние редактора варианта схемы: узлы/рёбра, выбор, подпись,
 * автосохранение в localStorage и экспорт PNG (+ регистрация в реестре
 * для приложений к протоколу).
 */
export const useFlowEditor = (flow: LeadsFlowDef, onRemoved: () => void) => {
    const initial = useMemo(() => {
        const variant = loadFlowVariant(flow.id);
        return {
            nodes: buildFlowNodes(variant?.nodes ?? flow.nodes),
            edges: buildFlowEdges(variant?.edges ?? flow.edges),
            caption: variant?.caption ?? '',
        };
    }, [flow]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
    const [caption, setCaption] = useState(initial.caption);
    const [selection, setSelection] = useState<{
        nodeId?: string;
        edgeId?: string;
    }>({});

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const addCounterRef = useRef(0);
    const nodesRef = useRef<Node[]>(nodes);
    nodesRef.current = nodes;
    const captionRef = useRef(caption);
    captionRef.current = caption;

    const selectedNode = nodes.find((node) => node.id === selection.nodeId);
    const selectedEdge = edges.find((edge) => edge.id === selection.edgeId);

    const onConnect = useCallback(
        (connection: Connection) =>
            setEdges((current) =>
                addEdge(
                    {
                        ...connection,
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed },
                        labelStyle: EDGE_LABEL_STYLE,
                    },
                    current,
                ),
            ),
        [setEdges],
    );

    const onSelectionChange = useCallback(
        ({ nodes: pickedNodes, edges: pickedEdges }: OnSelectionChangeParams) =>
            setSelection({
                nodeId: pickedNodes[0]?.id,
                edgeId: pickedNodes.length ? undefined : pickedEdges[0]?.id,
            }),
        [],
    );

    const addNode = useCallback(
        (kind: LeadsFlowNodeDef['kind']) => {
            addCounterRef.current += 1;
            const order = addCounterRef.current;
            setNodes((current) => [
                ...current,
                {
                    id: `custom-${kind}-${Date.now().toString(36)}-${order}`,
                    type: kind,
                    position: {
                        x: 40 + (order % 4) * 44,
                        y: 40 + (order % 4) * 32,
                    },
                    data: { ...NEW_NODE_DATA[kind] },
                    selected: true,
                },
            ]);
        },
        [setNodes],
    );

    const updateSelectedNodeData = useCallback(
        (patch: Partial<LeadsFlowNodeData>) =>
            setNodes((current) =>
                current.map((node) =>
                    node.id === selection.nodeId
                        ? { ...node, data: { ...node.data, ...patch } }
                        : node,
                ),
            ),
        [selection.nodeId, setNodes],
    );

    const setSelectedEdgeLabel = useCallback(
        (label: string) =>
            setEdges((current) =>
                current.map((edge) =>
                    edge.id === selection.edgeId ? { ...edge, label } : edge,
                ),
            ),
        [selection.edgeId, setEdges],
    );

    const toggleSelectedEdgeDashed = useCallback(
        () =>
            setEdges((current) =>
                current.map((edge) => {
                    if (edge.id !== selection.edgeId) return edge;
                    const dashed = !(
                        edge.data as { dashed?: boolean } | undefined
                    )?.dashed;
                    return {
                        ...edge,
                        data: { ...edge.data, dashed },
                        style: edgeStrokeStyle(dashed),
                    };
                }),
            ),
        [selection.edgeId, setEdges],
    );

    const deleteSelected = useCallback(() => {
        const { nodeId, edgeId } = selection;
        if (nodeId) {
            setNodes((current) =>
                current.filter((node) => node.id !== nodeId),
            );
            setEdges((current) =>
                current.filter(
                    (edge) => edge.source !== nodeId && edge.target !== nodeId,
                ),
            );
        } else if (edgeId) {
            setEdges((current) =>
                current.filter((edge) => edge.id !== edgeId),
            );
        }
        setSelection({});
    }, [selection, setEdges, setNodes]);

    const reset = useCallback(() => {
        setNodes(buildFlowNodes(flow.nodes));
        setEdges(buildFlowEdges(flow.edges));
        setSelection({});
    }, [flow.edges, flow.nodes, setEdges, setNodes]);

    const remove = useCallback(() => {
        removeFlowVariant(flow.id);
        onRemoved();
    }, [flow.id, onRemoved]);

    const exportPng = useCallback(async () => {
        if (!wrapperRef.current) {
            throw new Error('Канвас не смонтирован');
        }
        return exportFlowPng(wrapperRef.current, nodesRef.current);
    }, []);

    const downloadPng = useCallback(async () => {
        try {
            downloadDataUrl(variantFileName(flow.id), await exportPng());
        } catch {
            // пустой канвас — скачивать нечего
        }
    }, [exportPng, flow.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveFlowVariant({
                flowId: flow.id,
                caption,
                nodes: toNodeDefs(nodes),
                edges: toEdgeDefs(edges),
                updatedAt: Date.now(),
            });
        }, AUTOSAVE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [caption, edges, flow.id, nodes]);

    useEffect(
        () =>
            registerFlowExport({
                flowId: flow.id,
                title: flow.title,
                getCaption: () => captionRef.current,
                exportPng,
            }),
        [exportPng, flow.id, flow.title],
    );

    return {
        wrapperRef,
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onSelectionChange,
        selectedNode: selectedNode as
            | (Node & { data: LeadsFlowNodeData })
            | undefined,
        selectedEdge: selectedEdge as Edge | undefined,
        caption,
        setCaption,
        addNode,
        updateSelectedNodeData,
        setSelectedEdgeLabel,
        toggleSelectedEdgeDashed,
        deleteSelected,
        reset,
        remove,
        downloadPng,
    };
};
