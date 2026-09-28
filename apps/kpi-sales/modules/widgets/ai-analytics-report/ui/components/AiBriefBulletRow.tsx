'use client';

import { Square } from 'lucide-react';
import {
    hasAiBriefBulletMeta,
    type AiBriefBulletView,
} from '../../lib/ai-brief-view.util';
import { AiBriefBulletMeta } from './AiBriefBulletMeta';
import { AiManagerName } from './AiManagerName';

interface AiBriefBulletRowProps {
    bullet: AiBriefBulletView;
}

/**
 * Пункт итогов. «На кого смотреть» начинается с имени менеджера, «Что
 * сделать» выглядит строкой списка дел; под текстом — слово изменения,
 * менеджер, тип звонка и ссылка на разбор, когда они есть.
 */
export const AiBriefBulletRow = ({ bullet }: AiBriefBulletRowProps) => (
    <li className="flex gap-2 rounded-md border border-border/60 p-3">
        {bullet.group === 'action' && (
            <Square
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden
            />
        )}
        <div className="min-w-0 space-y-2">
            {bullet.group === 'focus' && bullet.managerId && (
                <AiManagerName
                    managerId={bullet.managerId}
                    className="block text-sm"
                />
            )}
            <p className="text-sm">{bullet.text}</p>
            {hasAiBriefBulletMeta(bullet) && (
                <AiBriefBulletMeta bullet={bullet} />
            )}
        </div>
    </li>
);
