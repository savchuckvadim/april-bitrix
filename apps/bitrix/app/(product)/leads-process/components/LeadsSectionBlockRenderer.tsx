import React from 'react';
import { HowContentBlock } from '../../how-we-work/constants/types';
import { HowBlockRenderer } from '../../how-we-work/components/blocks/HowBlockRenderer';
import { LeadsSectionBlock } from '../constants/types';
import { LEADS_FLOWS } from '../constants/flows';
import { FlowBlock } from './flow/FlowBlock';
import { LeadsKanban } from './LeadsKanban';
import { LeadsLegend } from './LeadsLegend';
import { LeadsQuestionnaire } from './LeadsQuestionnaire';

interface LeadsSectionBlockRendererProps {
    block: LeadsSectionBlock;
}

/** Блоки страницы: свои типы (канвас, канбан, легенда) + блоки раздела «Как мы работаем». */
export const LeadsSectionBlockRenderer: React.FC<
    LeadsSectionBlockRendererProps
> = ({ block }) => {
    switch (block.type) {
        case 'flow': {
            const flow = LEADS_FLOWS[block.flowId];
            return flow ? <FlowBlock flow={flow} /> : null;
        }
        case 'kanban':
            return <LeadsKanban columns={block.columns} />;
        case 'legend':
            return <LeadsLegend />;
        case 'questionnaire':
            return (
                <LeadsQuestionnaire questionnaireId={block.questionnaireId} />
            );
        default:
            return <HowBlockRenderer block={block as HowContentBlock} />;
    }
};
