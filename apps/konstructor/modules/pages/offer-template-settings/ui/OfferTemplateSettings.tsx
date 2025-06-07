'use client';

import React, { useState } from 'react';
import { Block } from '@/app/lib/offer-style/types';
import { BlockEditor } from './components/BlockEditor';
import { v4 as uuidv4 } from 'uuid';
import { FontSelector } from './components/FontSelector';
import BlocksChooseMenu from './components/BlockChoose/BlocksChooseMenu';
import {  usePdfTemplateSettings } from '@/modules/feature/offer-pdf-settings';
import TemplateSelector from './components/TemplateSelector';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { DropbleOfferTemplatePriview } from './components/TemplateKonstructorPreview/DropbleOfferTemplatePriview';
import { ColorPicker } from '@/modules/shared';
import OfferTemplatePriview from './components/TemplateKonstructorPreview/OfferTemplatePriview';
import { TemplateColorsPicker } from './components/Colors/TemplateColorsPicker';



const BuilderPage: React.FC = () => {



  const {

    setBlock,
    current,
    editeble,
    items,

  
  } = usePdfTemplateSettings();



  const addBlock = (block: Block) => {
    const newBlock: Block = {
      ...block,
      id: uuidv4(),
    };
    setBlock(newBlock);
    // setBlocks((prev) => [...prev, newBlock]);
  };



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
      <div className="fixed top-15 overflow-scroll h-screen md:w-1/4 border-r border-gray-300 bg-gray-700 ">
        <div className="= w-full w-full p-4 bg-background text-foreground">
          <h1 className='text-2xl font-bold'>Настройки шаблона</h1>

          <TemplateSelector />
          <FontSelector />
          {/* <div className='flex flex-col space-y-2'>
            <h2 className="text-xl font-bold my-4">Цвет</h2>
            <ColorPicker color={current.colors.accentText || "#000000"} onChange={
              (color) => setColors({ ...current.colors, accentText: color })} />
          </div> */}
          <TemplateColorsPicker />
          <h2 className="text-xl font-bold my-4">Блоки</h2>
          <div className="flex flex-col space-y-2">

            <BlocksChooseMenu addBlock={(block) => addBlock(block as Block)} />
          </div>

        </div>
      </div>
      <div className='w-full md:w-1/4'></div>
      {/* Preview with DnD */}
      <div className="w-full md:w-2/4 p-4 ml-5"
        style={{
          backgroundColor: current.colors.background.value

        }}
      >
        <h2 className="text-xl font-bold mb-4">Предпросмотр</h2>
        {!editeble
          ? <DropbleOfferTemplatePriview />
          : <OfferTemplatePriview />
        }

      </div>

      {/* Block Editor */}
      <div className="w-full md:w-1/4 p-4 bg-background text-foreground">
        <h2 className="text-xl font-bold mb-4">Редактор блока</h2>


        <BlockEditor />

      </div>
    </div >

  </div>
  );
};

export default BuilderPage;
