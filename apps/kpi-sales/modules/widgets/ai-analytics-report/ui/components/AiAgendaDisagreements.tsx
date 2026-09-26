'use client';

import {
    aiFeedbackObjectLabel,
    type AiAgendaDisagreement,
} from '@/modules/entities/ai-analytics';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';
import { AI_AGENDA_TEXT } from '../../lib/ai-agenda-week.util';

interface AiAgendaDisagreementsProps {
    items: AiAgendaDisagreement[];
}

/**
 * Несогласия с разбором с понедельника прошлой недели по сейчас (окно
 * бэка): кто, с чем (по-человечески: «строка обзора», «звонок #id»,
 * «отзыв с сайта по разбору»…) и почему не согласен.
 */
export const AiAgendaDisagreements = ({
    items,
}: AiAgendaDisagreementsProps) => {
    const managerName = useAiManagerName();

    return (
        <section>
            <h4 className="mb-2 text-sm font-medium">
                {AI_AGENDA_TEXT.disagreementsTitle}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {items.length}
                </span>
            </h4>
            {items.length ? (
                <ul className="space-y-1 text-sm">
                    {items.map((item, index) => (
                        <li
                            key={`${item.object}-${index}`}
                            className="flex flex-wrap gap-x-2"
                        >
                            <span className="font-medium">
                                {managerName(item.managerId)}
                            </span>
                            <span className="text-muted-foreground">
                                {aiFeedbackObjectLabel(item.object)}
                            </span>
                            <span>
                                —{' '}
                                {item.reason || (
                                    <span className="text-muted-foreground">
                                        без причины
                                    </span>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground">
                    {AI_AGENDA_TEXT.disagreementsEmpty}
                </p>
            )}
        </section>
    );
};
