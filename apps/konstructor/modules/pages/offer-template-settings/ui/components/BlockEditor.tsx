'use client'
import React from 'react';
import { ImageUploader } from './ImageUploader';
import { usePdfTemplateSettings } from '@/modules/feature/offer-pdf-settings';
import { OfferPdfBlock } from '@/modules/feature/offer-pdf-settings/model/OfferPdfSettingsSlice';
import { Button } from '@workspace/ui/components/button';
import { Save, X } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@workspace/ui/components/input';


export const BlockEditor: React.FC = () => {
  const BlockWrapper = ({ children }: { children: React.ReactNode }) => {
    return <div className='flex flex-col gap-2'>
      {children}
      <Button className='btn btn-sm btn-primary' onClick={() => saveEditeble()}>Сохранить <Save /></Button>
      <Button className='btn btn-sm btn-error' onClick={() => cancelEditeble()}>Отменить <X /></Button>
    </div>
  }
  const { editeble, saveEditeble, cancelEditeble, editBlock } = usePdfTemplateSettings();
  const onChange = (block: OfferPdfBlock) => {
    debugger;
    editBlock(block as OfferPdfBlock);
  };
  debugger
  const block = editeble;
  if (!block) return null;

  switch (block.type) {
    case 'hero':
      return (
        <BlockWrapper>
           <div className="relative  h-[37mm]">
            <Image
                src={block.content.image || "/cover/hero.avif"}
                alt="hero image"
                fill
                className="object-cover"
                priority
            />
        </div>
          <Input
            className="border p-2 rounded"
            type="text"
            placeholder="Заголовок"
            defaultValue={block.content.slogan.text || ""}
            // value={block.content.slogan.text || ""}
            onChange={(e) => onChange({ ...block, content: { ...block.content, slogan: { ...block.content.slogan, text: e.target.value } } })}
          />
          <input
            className="border p-2 rounded"
            type="text"
            placeholder="Подзаголовок"
            value={block.content.subtitle.text || ""}
            onChange={(e) => onChange({ ...block, content: { ...block.content, subtitle: { ...block.content.subtitle, text: e.target.value } } })}
          />
          <ImageUploader
            // value={block.data.image}
            // onChange={(img) => onChange({ ...block, data: { ...block.data, image: img } })}
            onUpload={(url) => {
              onChange({ ...block, content: { ...block.content, image: url } })
            }}
          />
        </BlockWrapper>
      );
    // case 'header':
    //   return (
    //     <input
    //       type="text"
    //       value={block.data.title}
    //       onChange={(e) => handleChange('title', e.target.value)}
    //       className="border p-2 w-full"
    //       placeholder="Заголовок"
    //     />
    //   );
    // case 'text':
    //   return (
    //     <textarea
    //       value={block.data.text}
    //       onChange={(e) => handleChange('text', e.target.value)}
    //       className="border p-2 w-full"
    //       placeholder="Текст"
    //     />
    //   );
    // case 'image':
    //   return (
    //     <input
    //       type="text"
    //       value={block.data.url}
    //       onChange={(e) => handleChange('url', e.target.value)}
    //       className="border p-2 w-full"
    //       placeholder="URL изображения"
    //     />
    //   );
    // case 'textImage':
    //   return (
    //     <>
    //       <input
    //         type="text"
    //         value={block.data.url}
    //         onChange={(e) => handleChange('url', e.target.value)}
    //         className="border p-2 w-full mb-2"
    //         placeholder="URL изображения"
    //       />
    //       <textarea
    //         value={block.data.text}
    //         onChange={(e) => handleChange('text', e.target.value)}
    //         className="border p-2 w-full"
    //         placeholder="Текст"
    //       />
    //     </>
    //   );
    // case 'price':
    //   return (
    //     <div>
    //       {block.data.items.map((item: any, idx: number) => (
    //         <div key={idx} className="flex mb-2">
    //           <input
    //             type="text"
    //             value={item.name}
    //             onChange={(e) => {
    //               const items = [...block.data.items];
    //               items[idx].name = e.target.value;
    //               handleChange('items', items);
    //             }}
    //             className="border p-2 w-1/2 mr-2"
    //             placeholder="Наименование"
    //           />
    //           <input
    //             type="text"
    //             value={item.price}
    //             onChange={(e) => {
    //               const items = [...block.data.items];
    //               items[idx].price = e.target.value;
    //               handleChange('items', items);
    //             }}
    //             className="border p-2 w-1/2"
    //             placeholder="Цена"
    //           />
    //         </div>
    //       ))}
    //       <button
    //         onClick={() => handleChange('items', [...block.data.items, { name: '', price: '' }])}
    //         className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
    //       >
    //         Добавить позицию
    //       </button>
    //     </div>
    //   );
    case 'footer':
      return (
        <input
          type="text"
          value={block.content.left}
          onChange={(e) => onChange({ ...block, data: { ...block.data, left: e.target.value } })}
          className="border p-2 w-full"
          placeholder="Текст футера"
        />
      );
    default:
      return null;
  }
};
