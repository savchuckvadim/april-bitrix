'use client';

import type { AiAgendaDisagreement } from '@/modules/entities/ai-analytics';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';

interface AiAgendaDisagreementsProps {
    items: AiAgendaDisagreement[];
}

/** «Несогласия недели»: кто, с чем и почему не согласен с разбором. */
export const AiAgendaDisagreements = ({
    items,
}: AiAgendaDisagreementsProps) => {
    const managerName = useAiManagerName();

    return (
        <section>
            <h4 className="mb-2 text-sm font-medium">
                Несогласия недели
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {items.length}
                </span>
            </h4>
            {items.length ? (
                <ul className="space-y-1 text-sm">
                    {items.map((item, index) => (
                        <li
                            key={`${item.object}-${index}`}
                            className="flex flex-wrap gap-2"
                        >
                            <span className="font-medium">
                                {managerName(item.managerId)}
                            </span>
                            <span className="text-muted-foreground">
                                {item.object}
                            </span>
                            {item.reason && <span>— {item.reason}</span>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground">
                    За неделю несогласий с разбором не было.
                </p>
            )}
        </section>
    );
};
