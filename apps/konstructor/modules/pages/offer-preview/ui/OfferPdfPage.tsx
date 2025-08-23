"use server";

import React from "react";
import "@/style/print.css";
import AutoPaginatedLayout from "./components/AutoPaginatedLayout";
import { IOffer } from "@/modules/entities/offer";
import { IInfoBlock } from "@/modules/entities/infoblock";
import RenderOfferLetter from "@/modules/entities/offer-template-block/ui/letter/render-pdf/RenderOfferLetter";
import OfferHeroPdf from "@/modules/entities/offer-template-block/ui/hero/OfferHeroPdf";

const OfferPdfPage: React.FC<{ offer: IOffer }> = ({ offer }) => {
  const editable = false;
  const template = offer.template;
  const infoblocks: IInfoBlock[] = [];
  offer.infoblocks.map((group, index) => {
    if (index === 0) {
      group.infoblocks.map((iblock) => {
        if (iblock.descriptionForSale) {
          infoblocks.push(iblock);
        }
      });
    }
  });

  const pages = template?.pages.map((page, index) => {
    const blocks = page.blocks.map((block, index) => {
      switch (block.type) {
        case "hero":
          return (
            <OfferHeroPdf
              template={template}
              key={`pdf-${page.id}-${index}-${block.id}`}
              block={block}
            />
          );
        case "letter":
          return (
            <RenderOfferLetter
              template={template}
              key={`pdf-${page.id}-${index}-${block.id}`}
              block={block}
            />
          );
        // case 'price':
        //   return <div className='p-4'>
        //     <Table key="table" code="offer-details" data={fakePrices.filter((_, index) => index < 3)} firstCellName="Name" />
        //   </div>
        default:
          return (
            <div key={`pdf-${page.id}-${index}-${block.id}`}>{block.name}</div>
          );
      }
    });
    return (
      <AutoPaginatedLayout
        editable={false}
        blocks={blocks}
        key={`pdf-page-${page.id}`}
      />
    );
  });
  return (
    <>
      {pages}

      <AutoPaginatedLayout
        editable={editable}
        blocks={infoblocks.map((iblock, index) => {
          return (
            iblock.descriptionForSale && (
              <div key={`pdf-infoblock-${iblock.name}`} className="p-4">
                {!index && (
                  <h1 className="text-2xl font-bold  mb-2">
                    Информационное наполнение
                  </h1>
                )}
                <h2 className="text-xl font-bold mt-2 mb-1">{iblock.name}</h2>
                <p className="text-sm whitespace-pre-line">
                  {iblock.descriptionForSale}
                </p>
              </div>
            )
          );
        })}
      />

      {/* <AutoPaginatedLayout editable={editable} blocks={blocks} />
    <AutoPaginatedLayout editable={editable} blocks={infoblocks.map((iblock, index) => {

      return (iblock.descriptionForSale) && <div key={iblock.name} className='p-4'>
        {!index && <h1 className='text-2xl font-bold  mb-2'>Информационное наполнение</h1>}
        <h2 className='text-xl font-bold mt-2 mb-1'>{iblock.name}</h2>
        <p className='text-sm whitespace-pre-line'>{iblock.descriptionForSale}</p>
      </div>
    })

    } />
    <AutoPaginatedLayout editable={editable} blocks={blocks} />
    <AutoPaginatedLayout editable={editable} blocks={blocks} /> */}
    </>
  );
};
//   return (
//     <div
//       style={{ fontFamily: font }}
//       className="bg-white text-black min-h-screen flex flex-col items-center justify-start">
//       <div className={`pdf-page  ${editable ? 'w-[210mm] h-[297mm] border-1 border-gray-300 m-1' : ''}`}>
//         <OfferHero />
//         <OfferLetter />
//         <div className='p-4'>
//           <Table
//             code='offer-details'
//             data={fakePrices}
//             firstCellName='Name'

//           />
//         </div>
//       </div>

//       <div className={`pdf-page  ${editable ? 'w-[210mm] h-[297mm] border-1 border-gray-300 m-1' : ''}`}>
//         {/* <OfferHero /> */}
//         <OfferLetter />
//         <OfferHero />
//       </div>

//       <div className={`pdf-page  ${editable ? 'w-[210mm] h-[297mm] border-1 border-gray-300 m-1' : ''}`}>
//         <h1>Next page 2</h1>
//         {/* <OfferDetails /> */}
//         <p style={{ fontFamily: font }}>{faketext}</p>

//       </div>

//       <div className={`pdf-page p-4  ${editable ? 'w-[210mm] h-[297mm] border-1 border-gray-300 m-1' : ''}`}>
//         <h1>Next page 3</h1>
//         {/* <OfferFooter /> */}
//         {infoblocks.map(iblock => <div key={iblock.name}>
//           <h2 className='text-2xl font-bold mt-4 mb-1'>{iblock.name}</h2>
//           <p className='text-sm'>{iblock.description}</p>
//         </div>)}
//       </div>
//     </div>
//   );
// };

export default OfferPdfPage;
