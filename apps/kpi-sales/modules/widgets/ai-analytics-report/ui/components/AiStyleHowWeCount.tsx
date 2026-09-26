'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface AiStyleHowWeCountProps {
    items: string[];
}

/** Сворачиваемый блок «Как считаем» карточки стиля (метод, норма, периметр, запреты). */
export const AiStyleHowWeCount = ({ items }: AiStyleHowWeCountProps) => {
    const [open, setOpen] = useState(false);
    if (!items.length) return null;

    return (
        <div>
            <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-1 text-xs"
                aria-expanded={open}
                onClick={() => setOpen(value => !value)}
            >
                {open ? (
                    <ChevronDown className="h-3 w-3" />
                ) : (
                    <ChevronRight className="h-3 w-3" />
                )}
                Как считаем
            </Button>
            {open && (
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {items.map(item => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
