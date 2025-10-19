'use client';

import React from 'react';
import BlockChooseItem from './BlockChooseItem';
import { useOfferTemplateBlock } from '@/modules/entities/offer-template-block';
import {
    EOfferBlockType,
    IOfferTemplateBlock,
} from '@/modules/entities/offer-template-block/type/offer-template-block.type';
import { useOfferTemplateKonstructor } from '../../../hook/useOfferTemplateKonstructor';
import { getIsNeedFilterBlock } from '../../../lib/choose-lib/choose-widget.util';

const BlocksChooseMenu: React.FC<{
    addBlock: (block: IOfferTemplateBlock) => void;
}> = ({ addBlock }) => {
    const { blocks } = useOfferTemplateBlock();
    const { current } = useOfferTemplateKonstructor();

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h1>Выберите блок</h1>
            {Object.values(blocks).map(block => {
                if (
                    block.type === EOfferBlockType.letter.code &&
                    current && getIsNeedFilterBlock(current, blocks.letter)
                )
                    return null;
                if (
                    block.type === EOfferBlockType.price.code &&
                    current && getIsNeedFilterBlock(current, blocks.price)
                )
                    return null;

                return (
                    <BlockChooseItem
                        key={`block-choose-item-${block.id}`}
                        block={block}
                        addBlock={() => addBlock({ ...block })}
                    />
                );
            })}
        </div>
    );
};

export default BlocksChooseMenu;
