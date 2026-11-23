'use client';

import { ExternalLink } from 'lucide-react';

export interface DocumentLinkItem {
    link: string;
    name: string;
}

export interface DocumentLinksProps {
    /** Предупреждения бэка (что не сошлось при слиянии вариантов) — над ссылками */
    warnings: readonly string[];
    /** Готовые файлы документа, по ссылке на каждый */
    links: readonly DocumentLinkItem[];
}

/**
 * Итог формирования КП под кнопкой: предупреждения бэка и ссылки на все
 * готовые файлы. Общий для Word и PDF; пустой итог ничего не рисует.
 */
export const DocumentLinks = ({ warnings, links }: DocumentLinksProps) => (
    <>
        {warnings.map(warning => (
            <p key={warning} className="text-xs text-warning">
                {warning}
            </p>
        ))}
        {links.length ? (
            <ul className="flex flex-col gap-1">
                {links.map(item => (
                    <li key={item.link}>
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                        >
                            <ExternalLink className="h-3 w-3" />
                            {item.name}
                        </a>
                    </li>
                ))}
            </ul>
        ) : null}
    </>
);
