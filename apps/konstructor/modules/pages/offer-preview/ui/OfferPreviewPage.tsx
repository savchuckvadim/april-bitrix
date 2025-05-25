'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

import { Block, StylePreset } from '@/app/lib/offer-style/types';
import { STYLE_PRESETS } from '@/app/lib/offer-style/styles';
import { BlockRenderer } from '../../offer-template-settings/ui/components/BlockRenderer';

const PreviewPage: React.FC = () => {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');
  const dataParam = searchParams.get('data');

  if (!templateParam || !dataParam) {
    return <div>Недостаточно данных для предпросмотра.</div>;
  }

  const template = JSON.parse(decodeURIComponent(templateParam));
  const data = JSON.parse(decodeURIComponent(dataParam));

  const selectedStyle = STYLE_PRESETS.find((style) => style.id === template.styleId) as StylePreset;

  return (
    <div
      className="p-8"
      style={{
        backgroundColor: selectedStyle.backgroundColor,
        color: selectedStyle.textColor,
        fontFamily: selectedStyle.fontFamily,
      }}
    >
      {template.blocks.map((block: Block) => (
        <div key={block.id} className="mb-4">
          <BlockRenderer block={{ ...block, data: { ...block.data, ...data } }} />
        </div>
      ))}
    </div>
  );
};

export default PreviewPage;
