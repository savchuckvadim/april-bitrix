'use client';

import React, { useState } from 'react';
import { Block, StylePreset } from '@/app/lib/offer-style/types';
import { STYLE_PRESETS } from '@/app/lib/offer-style/styles';
import { BlockRenderer } from './components/BlockRenderer';
import { BlockEditor } from './components/BlockEditor';
import { StyleSelector } from './components/StyleSelector';
import { ImageUploader } from './components/ImageUploader';
import { v4 as uuidv4 } from 'uuid';



import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const BuilderPage: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(STYLE_PRESETS[0]?.id ?? "default");

  const sensors = useSensors(useSensor(PointerSensor));

  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = {
      id: uuidv4(),
      type,
      data: {},
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const duplicateBlock = (index: number) => {
    const block = blocks[index];
    const copy = { ...block, id: uuidv4() };
    setBlocks((prev) => [...prev.slice(0, index + 1), copy as Block, ...prev.slice(index + 1)]);
  };

  const updateBlock = (index: number, updatedBlock: Block) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    setBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
    setSelectedBlockIndex(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over?.id);
      setBlocks((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const selectedStyle = STYLE_PRESETS.find((style: StylePreset) => style.id === selectedStyleId) as StylePreset;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 p-4 bg-background text-foreground">
        <h2 className="text-xl font-bold mb-4">Блоки</h2>
        <div className="flex flex-col space-y-2">
          {["header", "text", "image", "textImage", "price", "footer"].map((type) => (
            <button key={type} onClick={() => addBlock(type as Block["type"])} className="btn btn-primary">
              Добавить {type}
            </button>
          ))}
        </div>

        <StyleSelector selectedId={selectedStyleId} onChange={setSelectedStyleId} />
      </div>

      {/* Preview with DnD */}
      <div className="w-full md:w-2/4 p-4">
        <h2 className="text-xl font-bold mb-4">Предпросмотр</h2>
        <div
          className="p-4 border rounded"
          style={{
            backgroundColor: selectedStyle.backgroundColor,
            color: selectedStyle.textColor,
            fontFamily: selectedStyle.fontFamily,
          }}
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block, index) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  index={index}
                  isSelected={selectedBlockIndex === index}
                  onSelect={() => setSelectedBlockIndex(index)}
                  onDelete={() => deleteBlock(index)}
                  onDuplicate={() => duplicateBlock(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Block Editor */}
      <div className="w-full md:w-1/4 p-4 bg-background text-foreground">
        <h2 className="text-xl font-bold mb-4">Редактор блока</h2>
        {selectedBlockIndex !== null && (
          <BlockEditor
            block={blocks[selectedBlockIndex]!}
            onChange={(updatedBlock) => updateBlock(selectedBlockIndex, updatedBlock)}
          />
        )}
      </div>
    </div>
  );
};

const SortableBlock = ({
  block,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  block: Block;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-4 p-2 border rounded bg-white cursor-pointer ${isSelected ? 'border-blue-500' : 'border-gray-200'}`}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <BlockRenderer block={block} />
      <div className="flex gap-2 mt-2">
        <button onClick={onDuplicate} className="btn btn-xs bg-yellow-500 text-white">Дублировать</button>
        <button onClick={onDelete} className="btn btn-xs bg-red-500 text-white">Удалить</button>
      </div>
    </div>
  );
};

export default BuilderPage;
