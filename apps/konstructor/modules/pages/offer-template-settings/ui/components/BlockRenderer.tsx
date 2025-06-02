import React from 'react';
import { Block } from '@/app/lib/offer-style/types';

export const BlockRenderer: React.FC<{ block: Block }> = ({ block }) => {
  switch (block.type) {
    case 'hero':
    case "hero":
      return (
        <div className="p-4 bg-gray-100 text-center">
          {block.data.image && (
            <img src={block.data.image} alt="Hero" className="w-full h-auto mb-4 rounded" />
          )}
          <h1 className="text-3xl font-bold">{block.data.title ?? "Hero Title"}</h1>
          <p>{block.data.subtitle ?? "Hero subtitle or call to action"}</p>
        </div>
      );
    case 'header':
      return <h1 className="text-3xl font-bold my-4">{block.data.title}</h1>;
    case 'text':
      return <p className="my-2">{block.data.text}</p>;
    case 'image':
      return <img src={block.data.url} alt="" className="my-2" />;
    case 'textImage':
      return (
        <div className="flex my-2">
          <img src={block.data.url} alt="" className="w-1/2 mr-2" />
          <p className="w-1/2">{block.data.text}</p>
        </div>
      );
    case 'price':
      return (
        <table className="w-full my-4 border">
          <thead>
            <tr>
              <th className="border px-2">Наименование</th>
              <th className="border px-2">Цена</th>
            </tr>
          </thead>
          <tbody>
            {block.data.items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="border px-2">{item.name}</td>
                <td className="border px-2">{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'footer':
      return <footer className="text-sm text-center my-4">{block.data.text}</footer>;
    default:
      return null;
  }
};
