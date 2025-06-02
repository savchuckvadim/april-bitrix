'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

import OfferHero from './components/OfferHero';
import "@/style/print.css"
import OfferLetter from './components/OfferLetter';
const style = {
  backgroundColor: '#000',
  color: '#fff',
  fontFamily: 'Arial',
};
export const faketext = 'Идейные соображения высшего порядка, а также современная методология .'
const PreviewPage: React.FC = () => {

  const searchParams = useSearchParams();
  const editable = searchParams.get('readonly') !== 'true';

  console.log('editable', editable);
  console.log(editable);
  const paragraphs = faketext.split('\n\n');
  const chunkSize = 8;
  const pages = [];

  for (let i = 0; i < paragraphs.length; i += chunkSize) {
    pages.push(paragraphs.slice(i, i + chunkSize));
  }

  return (
    <div className="bg-white text-black min-h-screen flex flex-col items-center justify-start">
      <div className={`pdf-page  ${editable ? 'w-[210mm] h-[297mm] border-1 border-gray-300 m-1' : ''}`}>
        <OfferHero />
        <OfferLetter />
      </div>

      <div className={`pdf-page  ${editable ? 'w-[210mm] h-[297mm] border-1 border-gray-300 m-1' : ''}`}>
        {/* <OfferHero /> */}
        <OfferLetter />
        <OfferHero />
      </div>

      <div className={`pdf-page  ${editable ? 'w-[210mm] h-[297mm] border-1 border-gray-300 m-1' : ''}`}>
        <h1>Next page 2</h1>
        {/* <OfferDetails /> */}
        <p>{faketext}</p>
      </div>

      <div className={`pdf-page  ${editable ? 'w-[210mm] h-[297mm] border-1 border-gray-300 m-1' : ''}`}>
        <h1>Next page 3</h1>
        {/* <OfferFooter /> */}
        <p>{faketext}</p>
      </div>
    </div>
  );
};

export default PreviewPage;
