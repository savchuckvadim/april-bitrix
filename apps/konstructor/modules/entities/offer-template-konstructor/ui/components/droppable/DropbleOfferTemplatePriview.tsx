import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverlay,
    useSensor,
    PointerSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';

import React, { useState } from 'react';
import { findBlockById } from '../../../lib/utils/block.util';

import {
    IOfferTemplateBlock,
    useOfferTemplateBlock,
} from '@/modules/entities/offer-template-block';
import { useOfferTemplateKonstructor } from '../../../hook/useOfferTemplateKonstructor';
import DroppablePage from './DroppablePage';
import SortableBlock from './SortableBlock';
import DroppableCreateNewPageZone from './DroppableCreateNewPageZone';

export const DropbleOfferTemplatePriview = () => {
    const [draggedBlock, setDraggedBlock] =
        useState<IOfferTemplateBlock | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));
    const { current, updatePages, deleteBlock } = useOfferTemplateKonstructor();

    const { editeble, setEditebleBlock } = useOfferTemplateBlock();

    const handleDragEnd = (event: DragEndEvent) => {
        updatePages(event);
        setDraggedBlock(null);
        // setDraggedPage(null);
        setOverId(null);
    };


    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={event => {
                const block = current && findBlockById(current, event.active.id as string);
                setDraggedBlock(block ?? null);
                // setDraggedPage(findPageByBlockId(current, event.active.id as string) ?? null);
            }}
            onDragOver={({ over }) => {
                // setOverId(over?.id as string | null);
                if (!over) return;
                console.log('over', over.id);
                setOverId(over.id as string);
            }}
        >
            {current && current.pages.map(page => {
                return (
                    <div
                        key={`sortable-page-${page.id}`}
                        style={{
                            backgroundColor: current.colors.background.value,
                        }}
                    >
                        {' '}
                        <DroppablePage page={page} overId={overId}>
                            <SortableContext
                                items={page.blocks.map(b => b.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {page.blocks.map((block, index) => (
                                    <SortableBlock
                                        key={block.id}
                                        block={block}
                                        index={index}
                                        isSelected={
                                            editeble && editeble.id === block.id
                                                ? true
                                                : false
                                        }
                                        isDragging={false}
                                        overId={overId}
                                        setEditeble={() =>
                                            setEditebleBlock(block)
                                        }
                                        onDelete={() => deleteBlock(block.id)}
                                    // onEdit={() => setEditeble(block)}
                                    />
                                ))}
                            </SortableContext>

                            {/* </div> */}
                        </DroppablePage>
                    </div>
                );
            })}
            <DroppableCreateNewPageZone />
            <DragOverlay>
                {draggedBlock ? (
                    <SortableBlock
                        block={draggedBlock}
                        isDragging={true}
                        index={0}
                        overId={null}
                        isSelected={false}
                        setEditeble={() => { }}
                        onDelete={() => { }}
                    // onEdit={() => { }}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
