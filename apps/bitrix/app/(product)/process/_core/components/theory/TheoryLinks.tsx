'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import type { TheoryLink } from '../../theory-types';

interface TheoryLinksProps {
    items: TheoryLink[];
}

/**
 * Ссылки-действия под текстом главы: печатная версия брифа, файл, соседняя
 * глава. Ссылка на файл в `public/` — обычный `<a download>`: `next/link`
 * такой переход перехватывает и файл не скачивается.
 */
export const TheoryLinks: FC<TheoryLinksProps> = ({ items }) => (
    <div className="flex flex-wrap gap-3">
        {items.map(item => (
            <div
                key={item.href}
                className="bg-card min-w-56 flex-1 rounded-xl border p-4"
            >
                <Button asChild variant="outline" className="w-full">
                    {item.download ? (
                        <a href={item.href} download>
                            {item.label}
                            <Download className="ml-1.5 size-4" aria-hidden />
                        </a>
                    ) : (
                        <Link href={item.href}>
                            {item.label}
                            <ArrowRight className="ml-1.5 size-4" aria-hidden />
                        </Link>
                    )}
                </Button>
                {item.note && (
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {item.note}
                    </p>
                )}
            </div>
        ))}
    </div>
);
