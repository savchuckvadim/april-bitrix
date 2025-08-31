'use client';

import React from 'react';

import { FontSelector } from './components/font/FontSelector';

import {
    IOfferTemplateBlock,
    useOfferTemplateBlock,
} from '@/modules/entities/offer-template-block';
import { useOfferTemplateKonstructor } from '../hook/useOfferTemplateKonstructor';
import { OfferTemplateSelector } from '@/modules/entities/offer-template';
import BlocksChooseMenu from './components/blocks-choose-menu/BlocksChooseMenu';
import TemplateColorsPicker from './components/color/TemplateColorsPicker';
import { DropbleOfferTemplatePriview } from './components/droppable/DropbleOfferTemplatePriview';
import OfferTemplatePriview from './components/preview/OfferTemplatePriview';
import BlockEditorWidget from './components/block-editor/BlockEditorWidget';

const OfferTemplateKonstructor: React.FC = () => {
    const { addBlock } = useOfferTemplateKonstructor();

    const { editeble } = useOfferTemplateBlock();
    const { current } = useOfferTemplateKonstructor();

    // return (<div className='flex flex-col h-screen overflow-auto'>
    //   <div className='p-4 h-15 bg-gray-200'>
    //     <div className='flex gap-2'>
    //       <Link href="/offer/preview">
    //         <Button>
    //           Сохранить Шаблон
    //         </Button>

    //       </Link>

    //       <Link href="/offer/preview">

    //         <Button>
    //           Сохранить как новый
    //         </Button>
    //       </Link>
    //     </div>

    //   </div>
    return (
        <>
            {current ? (
                <div className="flex flex-col md:flex-row h-[calc(100vh-150px)]">
                    {/* Sidebar */}
                    <div className="fixed top-15 overflow-scroll h-screen md:w-1/4 border-r border-gray-300 bg-gray-700 ">
                        <div className="= w-full w-full p-4 bg-background text-foreground">
                            <h1 className="text-2xl font-bold">
                                Настройки шаблона
                            </h1>

                            <OfferTemplateSelector />
                            <FontSelector />

                            <TemplateColorsPicker />
                            <h2 className="text-xl font-bold my-4">Блоки</h2>
                            <div className="flex flex-col space-y-2">
                                <BlocksChooseMenu
                                    addBlock={block =>
                                        addBlock(block as IOfferTemplateBlock)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/4"></div>
                    {/* Preview with DnD */}
                    <div className="w-full md:w-2/4 p-4 ml-5">
                        <h2 className="text-xl font-bold mb-4">Предпросмотр</h2>
                        <div>
                            {!editeble ? (
                                <DropbleOfferTemplatePriview />
                            ) : (
                                <OfferTemplatePriview />
                            )}
                        </div>
                    </div>

                    {/* Block Editor */}
                    <BlockEditorWidget />
                </div>
            ) : (
                <></>
            )}
        </>
        // </div>
    );
};

export default OfferTemplateKonstructor;
