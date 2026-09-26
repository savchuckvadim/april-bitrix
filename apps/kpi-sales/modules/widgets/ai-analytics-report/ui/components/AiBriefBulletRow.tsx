'use client';

import { ToneBadge } from '@workspace/april-ui';
import type { AiBriefBullet } from '@/modules/entities/ai-analytics';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';
import { formatAiBriefFactRefs } from '../../lib/ai-brief.util';
import { AiCallTypeBadge } from './AiCallTypeBadge';

interface AiBriefBulletRowProps {
    bullet: AiBriefBullet;
}

/** Буллет резюме: текст, чип менеджера, бэйдж типа звонка, коды фактов мелким серым. */
export const AiBriefBulletRow = ({ bullet }: AiBriefBulletRowProps) => {
    const managerName = useAiManagerName();
    const factRefs = formatAiBriefFactRefs(bullet.factRefs);
    const hasMeta = !!bullet.managerId || !!bullet.callType || !!factRefs;

    return (
        <li className="rounded-md border border-border/60 p-3">
            <p className="text-sm">{bullet.text}</p>
            {hasMeta && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {bullet.managerId && (
                        <ToneBadge tone="muted" variant="soft" size="sm">
                            {managerName(bullet.managerId)}
                        </ToneBadge>
                    )}
                    {bullet.callType && (
                        <AiCallTypeBadge code={bullet.callType} />
                    )}
                    {factRefs && (
                        <span className="text-[0.6875rem] text-muted-foreground">
                            факты: {factRefs}
                        </span>
                    )}
                </div>
            )}
        </li>
    );
};
