'use client';

import {
    AI_BRIEF_NO_BULLETS_TEXT,
    buildAiBriefGroups,
    type AiBriefBulletSource,
} from '../../lib/ai-brief-view.util';
import { AiBriefGroupSection } from './AiBriefGroupSection';

interface AiBriefBulletsProps {
    bullets: readonly AiBriefBulletSource[] | null | undefined;
}

/**
 * Пункты итогов по группам: что изменилось, на кого смотреть, что сделать
 * на неделе. Группы без пунктов не показываем; пунктов нет совсем —
 * остаётся только главный вывод.
 */
export const AiBriefBullets = ({ bullets }: AiBriefBulletsProps) => {
    const groups = buildAiBriefGroups(bullets);

    return groups.length ? (
        <div className="grid gap-4 lg:auto-cols-fr lg:grid-flow-col">
            {groups.map(group => (
                <AiBriefGroupSection key={group.group} group={group} />
            ))}
        </div>
    ) : (
        <p className="py-2 text-xs text-muted-foreground">
            {AI_BRIEF_NO_BULLETS_TEXT}
        </p>
    );
};
