import React from 'react';

interface DetailsListProps {
    title: string;
    items: string[];
}

/** Маркированный список раскрытой строки (ОП История, комментарии). */
export const DetailsList: React.FC<DetailsListProps> = ({ title, items }) => {
    if (!items.length) return null;
    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                {items.map((item, i) => (
                    <li key={`${title}-${i}`}>{item}</li>
                ))}
            </ul>
        </div>
    );
};
