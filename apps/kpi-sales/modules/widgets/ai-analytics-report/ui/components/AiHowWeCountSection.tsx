'use client';

import { Fragment } from 'react';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import type { AiAboutSectionView } from '../../lib/ai-about-phase4.util';
import type { AiTheoryTopic } from '../../lib/ai-theory-link';
import { AiTheoryLink } from './AiTheoryLink';

interface AiHowWeCountSectionProps {
    view: AiAboutSectionView;
    /** Тема «Подробнее в теории». */
    topic: AiTheoryTopic;
}

/**
 * Общая вёрстка секций Фазы 4 в «Как считаем»: заголовок с месяцем и
 * статусом, строки «подпись — значение» (подпись с подсказкой пунктиром),
 * почему проверка не пройдена, «что делать» и ссылка на теорию. Тексты
 * собираются в lib (ai-about-*.util.ts).
 */
export const AiHowWeCountSection = ({
    view,
    topic,
}: AiHowWeCountSectionProps) => (
    <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-medium">{view.title}</h4>
            <span className="text-xs text-muted-foreground">{view.month}</span>
            <ToneBadge tone={view.badge.tone} variant="soft" size="sm">
                {view.badge.label}
            </ToneBadge>
        </div>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[minmax(0,14rem)_1fr]">
            {view.facts.map((item, index) => (
                <Fragment key={`${index}-${item.label}`}>
                    <dt className="text-muted-foreground">
                        {item.hint.length ? (
                            <HintTooltip title={item.label} lines={item.hint}>
                                <span className="border-b border-dashed border-muted-foreground">
                                    {item.label}
                                </span>
                            </HintTooltip>
                        ) : (
                            item.label
                        )}
                    </dt>
                    <dd>{item.value}</dd>
                </Fragment>
            ))}
        </dl>
        {view.reasons.length > 0 && (
            <div className="text-xs text-muted-foreground">
                <p>Что мешает пройти проверку:</p>
                <ul className="list-disc pl-5">
                    {view.reasons.map(reason => (
                        <li key={reason}>{reason}</li>
                    ))}
                </ul>
            </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <p>
                <span className="font-medium">Что делать: </span>
                {view.todo}
            </p>
            <AiTheoryLink topic={topic} />
        </div>
    </section>
);
