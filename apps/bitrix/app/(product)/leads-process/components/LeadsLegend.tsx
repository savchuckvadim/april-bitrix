import React from 'react';

const LEGEND_ITEMS = [
    { className: 'bg-primary', label: 'система (автоматика)' },
    { className: 'bg-muted-foreground/50', label: 'менеджер' },
    { className: 'bg-warning', label: 'руководитель / развилка' },
    { className: 'bg-destructive', label: 'мусор' },
    { className: 'bg-success', label: 'результат' },
];

/** Легенда цветов и форм схем. */
export const LeadsLegend: React.FC = () => (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {LEGEND_ITEMS.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5">
                <i
                    className={`inline-block h-3 w-3 rounded-sm ${item.className}`}
                />
                {item.label}
            </span>
        ))}
        <span>ромб — вопрос-развилка · круг — начало/итог · пунктир — редкий путь</span>
    </div>
);
