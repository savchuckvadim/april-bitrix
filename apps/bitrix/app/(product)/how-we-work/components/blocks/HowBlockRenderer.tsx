import React from 'react';
import { HowContentBlock } from '../../constants/types';
import { HOW_QUESTIONNAIRES } from '../../constants/questionnaires';
import { renderInline } from '../../lib/render-inline';
import { HowCards } from './HowCards';
import { HowSteps } from './HowSteps';
import { HowTable } from './HowTable';
import { HowNote } from './HowNote';
import { HowStory } from './HowStory';
import { HowDiagram } from './HowDiagram';
import { HowScreenPlaceholder } from './HowScreenPlaceholder';
import { HowQuestionnaire } from '../questionnaire/HowQuestionnaire';

interface HowBlockRendererProps {
    block: HowContentBlock;
}

/** Маппинг контентного блока на компонент. */
export const HowBlockRenderer: React.FC<HowBlockRendererProps> = ({
    block,
}) => {
    switch (block.type) {
        case 'lead':
            return (
                <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
                    {renderInline(block.text)}
                </p>
            );
        case 'heading':
            return (
                <h2 className="pt-4 text-2xl font-bold tracking-tight text-foreground">
                    {block.text}
                </h2>
            );
        case 'paragraph':
            return (
                <p className="max-w-3xl leading-relaxed text-foreground/90">
                    {renderInline(block.text)}
                </p>
            );
        case 'list':
            return (
                <ul className="max-w-3xl list-disc space-y-1.5 pl-6 text-foreground/90">
                    {block.items.map((item, index) => (
                        <li key={index} className="leading-relaxed">
                            {renderInline(item)}
                        </li>
                    ))}
                </ul>
            );
        case 'cards':
            return <HowCards columns={block.columns} items={block.items} />;
        case 'steps':
            return <HowSteps items={block.items} />;
        case 'table':
            return (
                <HowTable
                    head={block.head}
                    rows={block.rows}
                    caption={block.caption}
                />
            );
        case 'note':
            return <HowNote tone={block.tone} text={block.text} />;
        case 'story':
            return <HowStory tag={block.tag} text={block.text} />;
        case 'diagram':
            return <HowDiagram chart={block.chart} caption={block.caption} />;
        case 'screen':
            return <HowScreenPlaceholder label={block.label} />;
        case 'questionnaire':
            return (
                <HowQuestionnaire
                    questionnaire={HOW_QUESTIONNAIRES[block.questionnaireId]}
                />
            );
        default:
            return null;
    }
};
