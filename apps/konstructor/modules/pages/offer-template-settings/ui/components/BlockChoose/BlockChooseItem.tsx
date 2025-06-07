'use client'

import { OfferPdfBlock } from '@/modules/feature/offer-pdf-settings';
import Image from 'next/image';
import React, { useState } from 'react';
export const fakeText = 'Вот вам яркий пример современных тенденций — современная методология разработки напрямую зависит от кластеризации усилий. Есть над чем задуматься: явные признаки победы институционализации будут заблокированы в рамках своих собственных рациональных ограничений. Кстати, сделанные на базе интернет-аналитики выводы набирают популярность среди определенных слоев населения, а значит, должны быть обнародованы.'
const bigFakeText = fakeText.repeat(2)


const BlockChooseItem: React.FC<{ block: OfferPdfBlock, addBlock: () => void }> = ({ block, addBlock }) => {
    const [isHovered, setIsHovered] = useState(false)
    const BlockWrapper = ({ children, mm }: { children: React.ReactNode, mm: number }) => {
        return <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative cursor-pointer my-3 p-1 w-full  border  rounded-md ${isHovered ? 'border-blue-500' : 'border-gray-300'}`}
           style={{
            height: `${mm}mm`
           }}
           onClick={addBlock}>
            {children}
        </div>
    }
    switch (block.type) {
        case 'hero':
            return <BlockWrapper mm={34}>
                <Image
                    src="/cover/hero.avif"
                    alt="hero image"
                    className="object-cover"
                    priority
                    fill
                    // width={234}
                    // height={124}
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        // width: '37mm',
                        // height: '124mm',
                    }}
                    
                />
            </BlockWrapper>
        case 'letter':
            return <BlockWrapper mm={34}>
                <div className='overflow-hidden h-full'>
                    <h2>{block.name}</h2>
                    <p className='text-xs'>{fakeText}</p>
                </div>
            </BlockWrapper>
        case 'bigLetter':
            return <BlockWrapper mm={80}>
                <div className='overflow-y-scroll min-h-full'>
                    <h2>{block.name}</h2>
                    <p className='text-xs'>{bigFakeText}</p>
                </div>
            </BlockWrapper>
        case 'documentNumber':
            return <BlockWrapper mm={20}>
                <h2>{block.name}</h2>
                <div className='flex flex-row justify-between text-xs h-full'>
                    <div className='text-left flex justify-center items-center'>
                        <p className='block h-[10mm]'>№34 от 12.03.2025</p>
                    </div>
                    <div className='text-right'>
                        <p>{block.content.appeal}</p>
                        <p>ЗАО "Конструктор"</p>
                        <p>Владиславу Владимировичу</p>
                    </div>
                </div>
            </BlockWrapper>
        case 'manager':
            return <BlockWrapper mm={30}>
                <h2>{block.name}</h2>
                <div className='flex flex-row justify-between text-xs h-full'>
                    <div className='text-left '>
                        <p>Директор по Продажам</p>
                        <p>Иванов Пётр Петрович</p>
                        <p>+7 (999) 999-99-99</p>
                    </div>
                </div>
            </BlockWrapper>
        case 'logo':
            return <BlockWrapper mm={30}>
                <Image src="/logo/garant.png" alt="logo" fill className='object-contain h-full' />
            </BlockWrapper>
        case 'footer':
            return <BlockWrapper mm={30}>
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
            </BlockWrapper>
        case 'header':
            return <BlockWrapper mm={30}>
                <h2>{block.name}</h2>
                <div className='flex flex-row justify-between text-xs h-full'>
                    <div className='text-left '>
                        <p>ООО Партнер</p>
                        <p>ИНН 1234567890</p>
                        <p>Санкт-Петербург, пр. Гагарина 73</p>
                    </div>
                    <div className='flex flex-row items-start justify-end'>
                        <Image src="/logo/garant.png" height={200} width={200} alt="logo" className='w-2/3' />
                    </div>
                </div>
            </BlockWrapper>
        default:
            return null;
    }
}

export default BlockChooseItem;
