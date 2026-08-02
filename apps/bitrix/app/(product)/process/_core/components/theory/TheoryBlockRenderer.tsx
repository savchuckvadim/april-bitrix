'use client';

import type { FC } from 'react';
import { renderInline } from '../../lib/render-inline';
import type { TheoryBlock } from '../../theory-types';
import { TheoryBenefit } from './TheoryBenefit';
import { TheoryDanger } from './TheoryDanger';
import { TheoryDiscourse } from './TheoryDiscourse';
import { TheoryObvious } from './TheoryObvious';
import { TheoryPractice } from './TheoryPractice';
import { TheoryScenario } from './TheoryScenario';

/** Раскладывает блок повествования в нужную врезку. */
export const TheoryBlockRenderer: FC<{ block: TheoryBlock }> = ({ block }) => {
    switch (block.kind) {
        case 'lead':
            return (
                <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed">
                    {renderInline(block.text)}
                </p>
            );

        case 'heading':
            return (
                <h2 className="text-foreground pt-4 text-2xl font-bold tracking-tight">
                    {block.text}
                </h2>
            );

        case 'paragraph':
            return (
                <p className="text-foreground/90 max-w-3xl leading-relaxed">
                    {renderInline(block.text)}
                </p>
            );

        case 'obvious':
            return (
                <TheoryObvious
                    intuition={block.intuition}
                    reality={block.reality}
                    consequence={block.consequence}
                />
            );

        case 'discourse':
            return (
                <TheoryDiscourse
                    question={block.question}
                    positions={block.positions}
                    price={block.price}
                    recommendation={block.recommendation}
                    preview={block.preview}
                />
            );

        case 'benefit':
            return (
                <TheoryBenefit
                    feature={block.feature}
                    meaning={block.meaning}
                    gain={block.gain}
                />
            );

        case 'practice':
            return <TheoryPractice text={block.text} />;

        case 'danger':
            return <TheoryDanger text={block.text} />;

        case 'scenario':
            return (
                <TheoryScenario title={block.title} options={block.options} />
            );

        default:
            return null;
    }
};
