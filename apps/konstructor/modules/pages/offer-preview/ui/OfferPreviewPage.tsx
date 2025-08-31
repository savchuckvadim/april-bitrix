'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import OfferHero from '../../../entities/offer-template-block/ui/hero/OfferHero';
import '@/style/print.css';
import { useAppSelector } from '@/modules/app';
import { Table } from '@/modules/shared';
import AutoPaginatedLayout from './components/AutoPaginatedLayout';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import OfferLetter from '@/modules/entities/offer-template-block/ui/letter/OfferLetter';
import { useOfferTemplateKonstructor } from '@/modules/entities/offer-template-konstructor/hook/useOfferTemplateKonstructor';
import { useOffer } from '@/modules/entities/offer';

const style = {
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: 'Arial',
};
const fakePrices = [
    {
        name: 'Name',
        actions: [
            {
                name: 'Action',
                value: 1,
            },
            {
                name: 'Action 2',
                value: 2,
            },
            {
                name: 'Action 3',
                value: 3,
            },
            {
                name: 'Action 4',
                value: 4,
            },
            {
                name: 'Action 5',
                value: 5,
            },
        ],
    },
    {
        name: 'Name',
        actions: [
            {
                name: 'Action',
                value: 1,
            },
            {
                name: 'Action 2',
                value: 2,
            },
            {
                name: 'Action 3',
                value: 3,
            },
            {
                name: 'Action 4',
                value: 4,
            },
            {
                name: 'Action 5',
                value: 5,
            },
        ],
    },
    {
        name: 'Name',
        actions: [
            {
                name: 'Action',
                value: 1,
            },
            {
                name: 'Action 2',
                value: 2,
            },
            {
                name: 'Action 3',
                value: 3,
            },
            {
                name: 'Action 4',
                value: 4,
            },
            {
                name: 'Action 5',
                value: 5,
            },
        ],
    },
    {
        name: 'Name',
        actions: [
            {
                name: 'Action',
                value: 1,
            },
            {
                name: 'Action 2',
                value: 2,
            },
            {
                name: 'Action 3',
                value: 3,
            },
            {
                name: 'Action 4',
                value: 4,
            },
            {
                name: 'Action 5',
                value: 5,
            },
        ],
    },
    {
        name: 'Name',
        actions: [
            {
                name: 'Action',
                value: 1,
            },
            {
                name: 'Action 2',
                value: 2,
            },
            {
                name: 'Action 3',
                value: 3,
            },
            {
                name: 'Action 4',
                value: 4,
            },
            {
                name: 'Action 5',
                value: 5,
            },
        ],
    },
    {
        name: 'Name',
        actions: [
            {
                name: 'Action',
                value: 1,
            },
            {
                name: 'Action 2',
                value: 2,
            },
            {
                name: 'Action 3',
                value: 3,
            },
            {
                name: 'Action 4',
                value: 4,
            },
            {
                name: 'Action 5',
                value: 5,
            },
        ],
    },
    {
        name: 'Name',
        actions: [
            {
                name: 'Action',
                value: 1,
            },
            {
                name: 'Action 2',
                value: 2,
            },
            {
                name: 'Action 3',
                value: 3,
            },
            {
                name: 'Action 4',
                value: 4,
            },
            {
                name: 'Action 5',
                value: 5,
            },
        ],
    },
    {
        name: 'Name',
        actions: [
            {
                name: 'Action',
                value: 1,
            },
            {
                name: 'Action 2',
                value: 2,
            },
            {
                name: 'Action 3',
                value: 3,
            },
            {
                name: 'Action 4',
                value: 4,
            },
            {
                name: 'Action 5',
                value: 5,
            },
        ],
    },
    {
        name: 'Name',
        actions: [
            {
                name: 'Action',
                value: 1,
            },
            {
                name: 'Action 2',
                value: 2,
            },
            {
                name: 'Action 3',
                value: 3,
            },
            {
                name: 'Action 4',
                value: 4,
            },
            {
                name: 'Action 5',
                value: 5,
            },
        ],
    },
];
export const faketext =
    'Идейные соображения высшего порядка, а также современная методология .';
const PreviewPage: React.FC = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const searchParams = useSearchParams();
    const editable = searchParams.get('readonly') !== 'true'; //сделать отдельную ssr страницу для этого в параметры которой передается offer
    const { offer } = useOffer();

    const current = offer?.template;
    const infoblocks = offer?.infoblocks[0]?.infoblocks;

    const handleGeneratePDF = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const response = await fetch('/api/offer/generate', {
                method: 'POST',
                body: JSON.stringify(offer),
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    console.log('editable', editable);
    console.log(editable);
    const paragraphs = faketext.split('\n\n');
    // const chunkSize = 8;
    // const pages = [];

    // for (let i = 0; i < paragraphs.length; i += chunkSize) {
    //   pages.push(paragraphs.slice(i, i + chunkSize));
    // }
    // const { current } = useOfferTemplateKonstructor();
    // const font = current?.font.value;

    // const infoblocks = useAppSelector((state) => state.infoblock.infoblocks);
    // const blocks = [
    //   <OfferHero key="hero"  />,
    //   <OfferLetter key="letter" />,
    //   <div className='p-4'>
    //     <Table key="table" code="offer-details" data={fakePrices.filter((_, index) => index < 3)} firstCellName="Name" />
    //   </div>,

    // ];

    const pages = current?.pages.map((page, index) => {
        const blocks = page.blocks.map((block, index) => {
            switch (block.type) {
                case 'hero':
                    return (
                        <OfferHero
                            key={`preview-${page.id}-${index}-${block.id}`}
                            block={block}
                        />
                    );
                case 'letter':
                    return (
                        <OfferLetter
                            inOffer={true}
                            key={`preview-${page.id}-${index}-${block.id}`}
                            block={block}
                        />
                    );
                case 'price':
                    return (
                        <div className="p-4">
                            <Table
                                key="table"
                                code="offer-details"
                                data={fakePrices.filter(
                                    (_, index) => index < 3,
                                )}
                                firstCellName="Name"
                            />
                        </div>
                    );
                default:
                    return (
                        <div key={`preview-${page.id}-${index}-${block.id}`}>
                            {block.name}
                        </div>
                    );
            }
        });
        return (
            <AutoPaginatedLayout
                editable={false}
                blocks={blocks}
                key={`preview-page-${page.id}`}
            />
        );
    });
    return (
        <>
            {editable && (
                <div className="p-4 h-15 bg-gray-200">
                    <div>
                        <Link href="/offer/template/settings">
                            <Button>Настройки КП</Button>
                        </Link>
                        <Link href="#" onClick={handleGeneratePDF}>
                            <Button className="ml-2" disabled={isGenerating}>
                                {isGenerating ? (
                                    <div className="flex items-center">
                                        <svg
                                            className="animate-spin h-5 w-5 mr-2"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Генерация PDF...
                                    </div>
                                ) : (
                                    'Скачать КП'
                                )}
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
            {pages}

            {infoblocks && (
                <AutoPaginatedLayout
                    editable={editable}
                    blocks={infoblocks.map((iblock, index) => {
                        return (
                            iblock.descriptionForSale && (
                                <div
                                    key={`preview-infoblock-${iblock.name}`}
                                    className="p-4"
                                >
                                    {!index && (
                                        <h1 className="text-2xl font-bold  mb-2">
                                            Информационное наполнение
                                        </h1>
                                    )}
                                    <h2 className="text-xl font-bold mt-2 mb-1">
                                        {iblock.name}
                                    </h2>
                                    <p className="text-sm whitespace-pre-line">
                                        {iblock.descriptionForSale}
                                    </p>
                                </div>
                            )
                        );
                    })}
                />
            )}

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

export default PreviewPage;
