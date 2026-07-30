'use client';

import React from 'react';
import { Panel } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Trash2 } from 'lucide-react';
import { LeadsFlowNodeData } from '../../../constants/types';

interface FlowSelectionPanelProps {
    selectedNode?: Node & { data: LeadsFlowNodeData };
    selectedEdge?: Edge;
    onNodeDataChange: (patch: Partial<LeadsFlowNodeData>) => void;
    onEdgeLabelChange: (label: string) => void;
    onEdgeDashedToggle: () => void;
    onDelete: () => void;
}

/** Панель подписей выбранного узла/ребра в правом нижнем углу канваса. */
export const FlowSelectionPanel: React.FC<FlowSelectionPanelProps> = ({
    selectedNode,
    selectedEdge,
    onNodeDataChange,
    onEdgeLabelChange,
    onEdgeDashedToggle,
    onDelete,
}) => {
    if (!selectedNode && !selectedEdge) return null;

    const edgeDashed = Boolean(
        (selectedEdge?.data as { dashed?: boolean } | undefined)?.dashed,
    );

    return (
        <Panel
            position="bottom-right"
            className="nodrag nopan mb-6 w-64 space-y-2 rounded-lg border bg-card/95 p-3 shadow-md backdrop-blur"
        >
            {selectedNode && (
                <>
                    <p className="text-xs font-semibold text-muted-foreground">
                        Выбранный элемент
                    </p>
                    <Input
                        value={selectedNode.data.label}
                        onChange={(event) =>
                            onNodeDataChange({ label: event.target.value })
                        }
                        placeholder="Название"
                        aria-label="Название элемента"
                    />
                    {selectedNode.type !== 'gateway' && (
                        <Input
                            value={selectedNode.data.sub ?? ''}
                            onChange={(event) =>
                                onNodeDataChange({ sub: event.target.value })
                            }
                            placeholder="Пояснение (вторая строка)"
                            aria-label="Пояснение элемента"
                        />
                    )}
                </>
            )}
            {selectedEdge && (
                <>
                    <p className="text-xs font-semibold text-muted-foreground">
                        Выбранная связь
                    </p>
                    <Input
                        value={
                            typeof selectedEdge.label === 'string'
                                ? selectedEdge.label
                                : ''
                        }
                        onChange={(event) =>
                            onEdgeLabelChange(event.target.value)
                        }
                        placeholder="Подпись связи"
                        aria-label="Подпись связи"
                    />
                    <Button
                        variant={edgeDashed ? 'default' : 'outline'}
                        size="sm"
                        onClick={onEdgeDashedToggle}
                        className="w-full"
                    >
                        Пунктир (исключительный путь)
                    </Button>
                </>
            )}
            <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="w-full text-destructive hover:text-destructive"
            >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Удалить выбранное
            </Button>
        </Panel>
    );
};
