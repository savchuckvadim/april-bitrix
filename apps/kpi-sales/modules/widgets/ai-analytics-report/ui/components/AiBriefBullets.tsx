'use client';

import type { AiBriefBullet } from '@/modules/entities/ai-analytics';
import { AiBriefBulletRow } from './AiBriefBulletRow';

interface AiBriefBulletsProps {
    bullets: AiBriefBullet[];
}

/** Буллеты резюме (до 5, прошли факт-чек); пусто — фактов не набралось. */
export const AiBriefBullets = ({ bullets }: AiBriefBulletsProps) =>
    bullets.length ? (
        <ul className="space-y-2">
            {bullets.map((bullet, index) => (
                <AiBriefBulletRow
                    key={`${index}-${bullet.text}`}
                    bullet={bullet}
                />
            ))}
        </ul>
    ) : (
        <p className="py-2 text-xs text-muted-foreground">
            Фактов для буллетов за период не набралось — только заголовок.
        </p>
    );
