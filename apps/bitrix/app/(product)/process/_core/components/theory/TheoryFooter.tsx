import type { FC } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SALES_TABS, salesTabPath } from '../../constants/views';

/**
 * Подвал повествовательной страницы: предыдущая и следующая части.
 *
 * Порядок берётся из того же списка, что рисует боковое меню, — иначе подписи
 * разъезжаются с реальным порядком чтения. Раньше здесь стояло жёсткое
 * «вернуться к схеме процесса», и после перестановки разделов оно начало врать:
 * схема теперь идёт ПОСЛЕ теории, а не до неё.
 */
export const TheoryFooter: FC<{ slug: string }> = ({ slug }) => {
    const index = SALES_TABS.findIndex(tab => tab.slug.endsWith(slug));
    const previous = index > 0 ? SALES_TABS[index - 1] : undefined;
    const next =
        index >= 0 && index < SALES_TABS.length - 1
            ? SALES_TABS[index + 1]
            : undefined;

    return (
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            {previous ? (
                <Link
                    href={salesTabPath(previous.slug)}
                    className="text-muted-foreground hover:text-foreground focus-visible:outline-primary flex items-center gap-2 rounded-md text-sm focus-visible:outline-2"
                >
                    <ArrowLeft className="size-4" aria-hidden />
                    Назад: {previous.label}
                </Link>
            ) : (
                <span />
            )}

            {next && (
                <Link
                    href={salesTabPath(next.slug)}
                    className="text-primary focus-visible:outline-primary flex items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:outline-2"
                >
                    Дальше: {next.label}
                    <ArrowRight className="size-4" aria-hidden />
                </Link>
            )}
        </footer>
    );
};
