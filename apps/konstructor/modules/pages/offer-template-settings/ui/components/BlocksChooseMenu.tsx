'use client'
import { usePdfTemplateSettings } from '@/modules/feature/offer-pdf-settings';
import React from 'react';
import BlockChooseItem from './BlockChooseItem';
import { blocks } from '@/modules/feature/offer-pdf-settings/model/OfferPdfSettingsSlice';
import { Block } from '@/app/lib/offer-style/types';

const BlocksChooseMenu: React.FC<{ addBlock: (block: Block) => void }> = ({ addBlock }) => {
    const { default: blocks } = usePdfTemplateSettings()


    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h1>Выберите блок</h1>
            {Object.values(blocks).map((block) => (
                <BlockChooseItem key={`block-choose-item-${block.id}`} block={block} addBlock={() => addBlock({...block})} />
            ))}
        </div>
    );
};

export default BlocksChooseMenu;
