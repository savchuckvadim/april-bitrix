'use client';

import React from 'react';
import {
    Background,
    BackgroundVariant,
    Controls,
    ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Download, RotateCcw, Trash2 } from 'lucide-react';
import { LeadsFlowDef } from '../../../constants/types';
import { useFlowEditor } from '../../../hooks/use-flow-editor';
import { useFlowFullscreen } from '../../../hooks/use-flow-fullscreen';
import { NODE_TYPES } from '../node-types';
import { FlowFrame } from '../FlowFrame';
import { FlowEditorToolbar } from './FlowEditorToolbar';
import { FlowSelectionPanel } from './FlowSelectionPanel';

export interface FlowEditorProps {
    flow: LeadsFlowDef;
    /** Вызывается после удаления варианта — родитель прячет редактор */
    onRemoved: () => void;
}

/**
 * Редактируемая копия схемы: узлы двигаются, связи рисуются от точек,
 * подписи правятся в панели выбора. Всё автосохраняется в браузере,
 * PNG скачивается кнопкой и прикладывается к протоколу листа решений.
 */
export const FlowEditor: React.FC<FlowEditorProps> = ({ flow, onRemoved }) => {
    const editor = useFlowEditor(flow, onRemoved);
    const { isFullscreen, toggle } = useFlowFullscreen();

    return (
        <FlowFrame
            height={flow.height}
            title={`${flow.title} — ваш вариант`}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggle}
            actions={
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={editor.downloadPng}
                        aria-label="Скачать PNG вашего варианта"
                        title="Скачать PNG"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={editor.reset}
                        aria-label="Вернуть оригинальную схему"
                        title="Сбросить к оригиналу"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={editor.remove}
                        aria-label="Удалить свой вариант"
                        title="Удалить вариант"
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </>
            }
            footer={
                <div className="border-t px-4 py-2.5">
                    <Input
                        value={editor.caption}
                        onChange={(event) =>
                            editor.setCaption(event.target.value)
                        }
                        placeholder="Подпишите ваш вариант — подпись попадёт в протокол решений"
                        aria-label="Подпись к вашему варианту схемы"
                    />
                </div>
            }
        >
            <div ref={editor.wrapperRef} className="h-full">
                <ReactFlow
                    nodes={editor.nodes}
                    edges={editor.edges}
                    nodeTypes={NODE_TYPES}
                    onNodesChange={editor.onNodesChange}
                    onEdgesChange={editor.onEdgesChange}
                    onConnect={editor.onConnect}
                    onSelectionChange={editor.onSelectionChange}
                    fitView
                    fitViewOptions={{ padding: 0.08 }}
                    minZoom={0.3}
                    deleteKeyCode={['Delete', 'Backspace']}
                    zoomOnScroll={isFullscreen}
                    preventScrolling={isFullscreen}
                    panOnDrag
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={18}
                        size={1}
                    />
                    <Controls />
                    <FlowEditorToolbar onAddNode={editor.addNode} />
                    <FlowSelectionPanel
                        selectedNode={editor.selectedNode}
                        selectedEdge={editor.selectedEdge}
                        onNodeDataChange={editor.updateSelectedNodeData}
                        onEdgeLabelChange={editor.setSelectedEdgeLabel}
                        onEdgeDashedToggle={editor.toggleSelectedEdgeDashed}
                        onDelete={editor.deleteSelected}
                    />
                </ReactFlow>
            </div>
        </FlowFrame>
    );
};
