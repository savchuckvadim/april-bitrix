import React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { renderInline } from '../../lib/render-inline';

interface HowCardsProps {
    columns?: 2 | 3;
    items: { title: string; text: string; badge?: string }[];
}

/** Сетка карточек «заголовок + текст (+ бейдж)». */
export const HowCards: React.FC<HowCardsProps> = ({ columns = 3, items }) => (
    <div
        className={`grid gap-4 sm:grid-cols-2 ${
            columns === 3 ? 'lg:grid-cols-3' : ''
        }`}
    >
        {items.map((item) => (
            <div key={item.title} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold text-foreground mb-1.5">
                    {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {renderInline(item.text)}
                </p>
                {item.badge && (
                    <Badge variant="outline" className="mt-3">
                        {item.badge}
                    </Badge>
                )}
            </div>
        ))}
    </div>
);
