import React from 'react';
import { renderInline } from '../../lib/render-inline';

interface HowStepsProps {
    items: { title: string; text: string }[];
}

/** Нумерованные шаги процесса. */
export const HowSteps: React.FC<HowStepsProps> = ({ items }) => (
    <ol className="space-y-4">
        {items.map((item, index) => (
            <li key={item.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                </span>
                <div>
                    <h3 className="font-semibold text-foreground">
                        {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {renderInline(item.text)}
                    </p>
                </div>
            </li>
        ))}
    </ol>
);
