// 'use client';

// import React, { useState } from 'react';

// import { v4 as uuidv4 } from 'uuid';
// import { FontSelector } from './components/FontSelector';
// import BlocksChooseMenu from './components/BlockChoose/BlocksChooseMenu';
// import { useOfferTemplateSettings } from '@/modules/feature/offer-pdf-settings';
// import TemplateSelector from './components/TemplateSelector';
// import { Button } from '@workspace/ui/components/button';
// import Link from 'next/link';
// import { DropbleOfferTemplatePriview } from './components/TemplateKonstructorPreview/DropbleOfferTemplatePriview';

// import OfferTemplatePriview from './components/TemplateKonstructorPreview/OfferTemplatePriview';
// import { TemplateColorsPicker } from './components/Colors/TemplateColorsPicker';
// import BlockEditorWidget from '../../../entities/offer-template-konstructor/ui/components/block-editor/BlockEditorWidget';
// import { IOfferTemplateBlock, useOfferTemplateBlock } from '@/modules/entities/offer-template-block';

// const BuilderPage: React.FC = () => {

//   const {
//     current,
//     // editeble,
//     setBlock,
//   } = useOfferTemplateSettings();

//   const { editeble, } = useOfferTemplateBlock()

//   const addBlock = (block: IOfferTemplateBlock) => {
//     const newBlock: IOfferTemplateBlock = {
//       ...block,
//       id: uuidv4(),
//     };
//     setBlock(newBlock);
//     // setBlocks((prev) => [...prev, newBlock]);
//   };

//   return (<div className='flex flex-col h-screen overflow-auto'>
//     <div className='p-4 h-15 bg-gray-200'>
//       <div className='flex gap-2'>
//         <Link href="/offer/preview">
//           <Button>
//             Сохранить Шаблон
//           </Button>

//         </Link>

//         <Link href="/offer/preview">

//           <Button>
//             Сохранить как новый
//           </Button>
//         </Link>
//       </div>

//     </div>
//     <div className="flex flex-col md:flex-row h-[calc(100vh-150px)]">
//       {/* Sidebar */}
//       <div className="fixed top-15 overflow-scroll h-screen md:w-1/4 border-r border-gray-300 bg-gray-700 ">
//         <div className="= w-full w-full p-4 bg-background text-foreground">
//           <h1 className='text-2xl font-bold'>Настройки шаблона</h1>

//           <TemplateSelector />
//           <FontSelector />
//           {/* <div className='flex flex-col space-y-2'>
//             <h2 className="text-xl font-bold my-4">Цвет</h2>
//             <ColorPicker color={current.colors.accentText || "#000000"} onChange={
//               (color) => setColors({ ...current.colors, accentText: color })} />
//           </div> */}
//           <TemplateColorsPicker />
//           <h2 className="text-xl font-bold my-4">Блоки</h2>
//           <div className="flex flex-col space-y-2">

//             <BlocksChooseMenu addBlock={(block) => addBlock(block as IOfferTemplateBlock)} />
//           </div>

//         </div>
//       </div>
//       <div className='w-full md:w-1/4'></div>
//       {/* Preview with DnD */}
//       <div className="w-full md:w-2/4 p-4 ml-5"

//       >
//         <h2 className="text-xl font-bold mb-4">Предпросмотр</h2>
//         <div

//         >{!editeble
//           ? <DropbleOfferTemplatePriview />
//           : <OfferTemplatePriview />
//           }
//         </div>
//       </div>

//       {/* Block Editor */}
//       <BlockEditorWidget />

//     </div >

//   </div>
//   );
// };

// export default BuilderPage;
