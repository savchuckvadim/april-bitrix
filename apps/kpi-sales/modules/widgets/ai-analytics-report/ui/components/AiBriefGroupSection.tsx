'use client';

import type { AiBriefGroupView } from '../../lib/ai-brief-view.util';
import { AiBriefBulletRow } from './AiBriefBulletRow';

interface AiBriefGroupSectionProps {
    group: AiBriefGroupView;
}

/** Группа пунктов итогов: заголовок и пункты под ним. */
export const AiBriefGroupSection = ({ group }: AiBriefGroupSectionProps) => (
    <section className="min-w-0 space-y-2">
        <h4 className="text-sm font-medium">{group.title}</h4>
        <ul className="space-y-2">
            {group.bullets.map(bullet => (
                <AiBriefBulletRow key={bullet.key} bullet={bullet} />
            ))}
        </ul>
    </section>
);
