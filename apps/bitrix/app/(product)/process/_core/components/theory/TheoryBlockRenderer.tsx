'use client';

import type { FC } from 'react';
import { HowDiagram } from '@/app/(product)/how-we-work/components/blocks/HowDiagram';
import { HowNote } from '@/app/(product)/how-we-work/components/blocks/HowNote';
import { HowSteps } from '@/app/(product)/how-we-work/components/blocks/HowSteps';
import { HowTable } from '@/app/(product)/how-we-work/components/blocks/HowTable';
import { HowQuestionnaire } from '@/app/(product)/how-we-work/components/questionnaire/HowQuestionnaire';
import { HOW_QUESTIONNAIRES } from '@/app/(product)/how-we-work/constants/questionnaires';
import { renderInline } from '../../lib/render-inline';
import type { TheoryBlock } from '../../theory-types';
import { TheoryBenefit } from './TheoryBenefit';
import { TheoryCode } from './TheoryCode';
import { TheoryDanger } from './TheoryDanger';
import { TheoryDiscourse } from './TheoryDiscourse';
import { TheoryGlossary } from './TheoryGlossary';
import { TheoryLinks } from './TheoryLinks';
import { TheoryList } from './TheoryList';
import { TheoryObvious } from './TheoryObvious';
import { TheoryPractice } from './TheoryPractice';
import { TheoryReadinessNote } from './TheoryReadinessNote';
import { TheoryScenario } from './TheoryScenario';
import { TheoryScreen } from './TheoryScreen';

/**
 * Раскладывает блок повествования в нужную врезку.
 *
 * Справочные блоки (таблица, шаги, примечание, схема) рисуют компоненты
 * движка «Как мы работаем»: у обоих разделов один тон и одна вёрстка, а две
 * копии одной таблицы рано или поздно разъедутся.
 */
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

        case 'screen':
            return (
                <TheoryScreen
                    label={block.label}
                    aspect={block.aspect}
                    src={block.src}
                />
            );

        case 'table':
            return (
                <HowTable
                    head={block.head}
                    rows={block.rows}
                    caption={block.caption}
                />
            );

        case 'steps':
            return <HowSteps items={block.items} />;

        case 'list':
            return <TheoryList items={block.items} ordered={block.ordered} />;

        case 'note':
            return <HowNote tone={block.tone} text={block.text} />;

        case 'diagram':
            return <HowDiagram chart={block.chart} caption={block.caption} />;

        case 'code':
            return (
                <TheoryCode
                    lang={block.lang}
                    code={block.code}
                    caption={block.caption}
                />
            );

        case 'glossary':
            return <TheoryGlossary items={block.items} />;

        case 'links':
            return <TheoryLinks items={block.items} />;

        case 'questionnaire':
            return (
                <HowQuestionnaire
                    questionnaire={HOW_QUESTIONNAIRES[block.questionnaireId]}
                />
            );

        case 'readiness':
            return <TheoryReadinessNote state={block.state} text={block.text} />;

        default:
            return null;
    }
};
