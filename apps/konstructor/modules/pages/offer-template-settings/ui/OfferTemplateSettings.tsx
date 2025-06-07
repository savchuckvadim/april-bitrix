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
  DragOverlay
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontSelector } from './components/FontSelector';
import BlocksChooseMenu from './components/BlocksChooseMenu';
import { OfferPdfBlock, usePdfTemplateSettings } from '@/modules/feature/offer-pdf-settings';
import TemplateSelector from './components/TemplateSelector';
import { Button } from '@workspace/ui/components/button';
import { findBlockById, findPageByBlockId } from '@/modules/feature/offer-pdf-settings/lib/utils/block.util';
import { cn } from '@workspace/ui/lib/utils';
import { OfferPdfPage } from '@/modules/feature/offer-pdf-settings/model/OfferPdfSettingsSlice';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
const BuilderPage: React.FC = () => {
  // const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  // const [selectedStyleId, setSelectedStyleId] = useState<string>(STYLE_PRESETS[0]?.id ?? "default");
  const [selectedStyleId, setSelectedStyleId] = useState(STYLE_PRESETS[0]?.id ?? "default");
  const [fontFamily, setFontFamily] = useState("Geist, sans-serif");

  const [draggedBlock, setDraggedBlock] = useState<OfferPdfBlock | null>(null);
  const [draggedPage, setDraggedPage] = useState<OfferPdfPage | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const { setCurrent, setPage, setBlock, current, items, updatePages } = usePdfTemplateSettings();

  const sensors = useSensors(useSensor(PointerSensor));

  const addBlock = (block: Block) => {
    const newBlock: Block = {
      ...block,
      id: uuidv4(),
    };
    setBlock(newBlock);
    // setBlocks((prev) => [...prev, newBlock]);
  };

  const editBlock = (index: number) => {
    // const block = blocks[index];
    // const copy = { ...block, id: uuidv4() };
    // setBlocks((prev) => [...prev.slice(0, index + 1), copy as Block, ...prev.slice(index + 1)]);
  };

  const updateBlock = (index: number, updatedBlock: Block) => {
    debugger
    // const newBlocks = [...blocks];
    // newBlocks[index] = updatedBlock;
    // setBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    // const newBlocks = [...blocks];
    // newBlocks.splice(index, 1);
    // setBlocks(newBlocks);
    // setSelectedBlockIndex(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    updatePages(event)
    setDraggedBlock(null);
    setDraggedPage(null);
  };

  // const selectedStyle = STYLE_PRESETS.find((style: StylePreset) => style.id === selectedStyleId) as StylePreset;

  const onSelect = (index: number) => {

    setSelectedBlockIndex(index);
  }
  // const downloadOffer = () => {
  //   fetch('/api/offer/', {
  //     method: 'GET',
  //     body: JSON.stringify(current),
  //   }).then(response => response.blob()).then(blob => {
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //   });
  // }
  return (<div className='flex flex-col min-h-screen'>
    <div className='p-4 h-15 bg-gray-200'>
      <div>
        <Link href="/offer/preview">
          <Button>
            Предпросмотр
          </Button>
        </Link>
     
      </div>

    </div>
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-150px)]"

    >
      {/* Sidebar */}
      <div className="w-full md:w-1/4 p-4 bg-background text-foreground">
        <TemplateSelector />
        <FontSelector />
        <h2 className="text-xl font-bold my-4">Блоки</h2>
        <div className="flex flex-col space-y-2">

          <BlocksChooseMenu addBlock={(block) => addBlock(block as Block)} />
        </div>

      </div>

      {/* Preview with DnD */}
      <div className="w-full md:w-2/4 p-4">
        <h2 className="text-xl font-bold mb-4">Предпросмотр</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={(event) => {
            const block = findBlockById(current, event.active.id as string);
            setDraggedBlock(block ?? null);
            setDraggedPage(findPageByBlockId(current, event.active.id as string) ?? null);
          }}
          onDragOver={({ over }) => {
            console.log(over);
            // setOverId(over?.id as string | null);
            if (!over) return;
            setOverId(over.id as string);
          }}

        >
          {current.pages.map(page =>
            <div
              key={`sortable-page-${page.id}`}
              // className="border border-gray-300 rounded h-[297mm] relative"
              className={cn(
                'border border-gray-300 rounded h-[297mm] relative transition-all mb-3',
                overId === page.id && 'ring-2 ring-blue-500'
              )}
              style={{

                fontFamily: fontFamily,
              }}
            >


              < SortableContext

                items={page.blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {
                  page.blocks.map((block, index) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      index={index}
                      isSelected={selectedBlockIndex === index}
                      isDragging={false}
                      onSelect={() => onSelect(index)}
                      onDelete={() => deleteBlock(index)}
                      onEdit={() => editBlock(index)}
                    />
                  ))
                }
              </SortableContext>


            </div>
          )}

          <DragOverlay >
            {draggedBlock ? (
              <SortableBlock block={draggedBlock} isDragging={true}
                index={0}
                isSelected={false}
                onSelect={() => { }}
                onDelete={() => { }}
                onEdit={() => { }}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Block Editor */}
      <div className="w-full md:w-1/4 p-4 bg-background text-foreground">
        <h2 className="text-xl font-bold mb-4">Редактор блока</h2>
        {current.pages.map(page =>
          selectedBlockIndex !== null && (

            <BlockEditor
              block={page.blocks[selectedBlockIndex]!}
              onChange={(updatedBlock) => updateBlock(selectedBlockIndex, updatedBlock)}
            />
          ))}
      </div>
    </div >

  </div>
  );
};

const SortableBlock = ({
  block,
  index,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  isDragging

}: {
  block: Block;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
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
      className={cn(
        `bg-white cursor-pointer ${isSelected ? 'border-blue-500' : 'border-gray-200'}`,
        isDragging && 'opacity-70 transform scale-95 pointer-events-none'
      )}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <BlockRenderer block={block} />
      {/* <div className="flex gap-2 mt-2 z-10 bottom-0 right-0">
        <Button onClick={onSelect} className="btn btn-xs bg-yellow-500 text-white">Редактировать</Button>
        <Button onClick={onDelete} className="btn btn-xs bg-red-500 text-white">Удалить</Button>
      </div> */}
    </div>
  );
};

export default BuilderPage;
