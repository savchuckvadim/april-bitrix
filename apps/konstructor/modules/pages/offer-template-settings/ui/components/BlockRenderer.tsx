import React from 'react';
import { Block } from '@/app/lib/offer-style/types';
import OfferHero from '@/modules/pages/offer-preview/ui/components/OfferHero';
import { fakeText } from './BlockChooseItem';
import Image from 'next/image';

export const BlockRenderer: React.FC<{ block: Block }> = ({ block }) => {
  switch (block.type) {
    case 'hero':
    case "hero":
      return (
        // <div className="p-4 bg-gray-100 text-center">
        //   {block.data.image && (
        //     <img src={block.data.image} alt="Hero" className="w-full h-auto mb-4 rounded" />
        //   )}
        //   <h1 className="text-3xl font-bold">{block.data.title ?? "Hero Title"}</h1>
        //   <p>{block.data.subtitle ?? "Hero subtitle or call to action"}</p>
        // </div>
        <OfferHero />
      );
    case 'header':
      return <div className={`w-full`}
        style={{
          height: `${block.height}mm`
        }}
      >
        {/* <h1 className="text-3xl font-bold my-4">{block.name}</h1> */}
        <div className={`flex flex-row justify-between text-xs  p-2`}>
          <div className='text-left '>
            <p>{block.content.rq.name}</p>
            <p>{block.content.rq.inn}</p>
            <p>{block.content.rq.address}</p>
            <p>{block.content.rq.email}</p>
          </div>
          <div className='text-right'>
            {/* <img src={block.content.logo.image} alt="logo" className='w-10 h-10' /> */}
            <Image
              src={block.content.logo.image}
              alt="logo"
              width={100}
              height={100}
              className='object-contain'
            />
          </div>
        </div>
      </div>;

    case 'bigLetter':
      return <div key={block.type} className={`w-full p-3`}
        style={{
          height: `${block.height}mm`
        }}
      >
        <h2>{block.name}</h2>
        <p>{block.content.text}</p>
      </div>
    case 'logo':
      return <img src={block.content.image} alt="" className="my-2" />;
    case 'letter':
      return (
        <div className={`flex my-2 p-3`}
          style={{
            height: `${block.height}mm`
          }}
        >

          <p className="w-full">{block.content.text}</p>
        </div>
      );
    case 'documentNumber':
      return <div className={`flex flex-row justify-between text-xs  p-2`}
        style={{
          height: `${block.height}mm`
        }}
      >
        <div className='text-left '>

          <p>№ {block.content.number}</p>
        </div>
        <div className='text-right'>
          <p>{block.content.appeal}</p>
          <p>{block.content.company}</p>

        </div>
      </div>;
    // case 'price':
    //   return (
    //     <table className="w-full my-4 border">
    //       <thead>
    //         <tr>
    //           <th className="border px-2">Наименование</th>
    //           <th className="border px-2">Цена</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {block.data.items.map((item: any, idx: number) => (
    //           <tr key={idx}>
    //             <td className="border px-2">{item.name}</td>
    //             <td className="border px-2">{item.price}</td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   );
    case 'footer':
      return <footer className={`${block.position === 'absolute' ? 'absolute' : ''} p-2 bottom-0 left-0 right-0 text-sm text-center h-[${block.height}mm]`}>
        <h2>{block.name}</h2>
        <div className='flex flex-row justify-between text-xs h-full'>
          <div className='text-left '>
            <p>Директор по Продажам</p>
            <p>Иванов Пётр Петрович</p>
            <p>+7 (999) 999-99-99</p>
          </div>
          <div className='text-right'>
            <p>ООО Партнер</p>
            <p>Ваш партнер в сфере права</p>
            <p>info@garant.ru</p>
          </div>
        </div>
      </footer>;
    default:
      return null;
  }
};
