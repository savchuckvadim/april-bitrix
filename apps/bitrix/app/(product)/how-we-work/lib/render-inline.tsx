import React from 'react';

/**
 * Рендер строки контента с поддержкой **жирного** выделения.
 * Другой разметки в контент-константах раздела нет.
 */
export const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
};
