'use client';

import { cn } from '@workspace/ui/lib/utils';
import { GUIDE_TEXT } from '../../../consts/ai-analytics-guide.const';
import type { GuideSectionItem } from '../../../model';

interface GuideTocProps {
    items: readonly GuideSectionItem[];
    activeCode: string | undefined;
    onSelect: (code: string) => void;
}

/**
 * Оглавление: разделы с якорями (`#code`), активный подсвечен. Ссылка —
 * настоящий якорь, чтобы адрес раздела можно было скопировать коллеге.
 */
export const GuideToc = ({ items, activeCode, onSelect }: GuideTocProps) => (
    <nav aria-label={GUIDE_TEXT.tocTitle} className="space-y-1">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {GUIDE_TEXT.tocTitle}
        </p>
        {items.map(item => (
            <a
                key={item.code}
                href={`#${item.code}`}
                onClick={event => {
                    event.preventDefault();
                    onSelect(item.code);
                }}
                className={cn(
                    'block rounded-md px-2 py-1.5 text-sm hover:bg-accent',
                    item.code === activeCode
                        ? 'bg-accent font-medium text-foreground'
                        : 'text-muted-foreground',
                )}
            >
                <span className="block">{item.title}</span>
                <span className="block text-[11px] text-muted-foreground">
                    {item.hasLaunch ? 'чек-лист · ' : ''}
                    {item.settingsCount + item.portalAiSettingsCount} настроек ·{' '}
                    {item.paramsCount} параметров · {item.endpointsCount} ручек
                </span>
            </a>
        ))}
    </nav>
);
