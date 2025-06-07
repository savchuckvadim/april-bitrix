import React from 'react';
import { Block } from '@/app/lib/offer-style/types';
import { ImageUploader } from './ImageUploader';

interface Props {
  block: Block;
  onChange: (block: Block) => void;
}

export const BlockEditor: React.FC<Props> = ({ block, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange(block);
  };

  switch (block.type) {
    case 'hero':
      return (
        <div className="flex flex-col gap-2">
          <input
            className="border p-2 rounded"
            type="text"
            placeholder="Заголовок"
            value={block.content.slogan || ""}
            onChange={(e) => onChange({ ...block, data: { ...block.data, title: e.target.value } })}
          />
          <input
            className="border p-2 rounded"
            type="text"
            placeholder="Подзаголовок"
            value={block.content.subtitle || ""}
            onChange={(e) => onChange({ ...block, data: { ...block.data, subtitle: e.target.value } })}
          />
          <ImageUploader
            // value={block.data.image}
            // onChange={(img) => onChange({ ...block, data: { ...block.data, image: img } })}
            onUpload={() => {}}
          />
        </div>
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
          onChange={(e) => handleChange('text', e.target.value)}
          className="border p-2 w-full"
          placeholder="Текст футера"
        />
      );
    default:
      return null;
  }
};
