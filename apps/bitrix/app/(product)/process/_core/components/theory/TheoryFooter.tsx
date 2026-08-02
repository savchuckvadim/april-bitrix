import type { FC } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
    SALES_BASE_PATH,
    THEORY_TABS,
    salesTabPath,
} from '../../constants/views';

/**
 * Подвал повествовательной страницы: вторая часть и возврат к схеме.
 *
 * Читатель, дочитавший до конца, должен получить следующий шаг, а не тупик.
 */
export const TheoryFooter: FC<{ slug: string }> = ({ slug }) => {
    const next = THEORY_TABS.find(tab => !tab.slug.endsWith(slug));

    return (
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            <Link
                href={SALES_BASE_PATH}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-primary flex items-center gap-2 rounded-md text-sm focus-visible:outline-2"
            >
                <ArrowLeft className="size-4" aria-hidden />
                Вернуться к схеме процесса
            </Link>

            {next && (
                <Link
                    href={salesTabPath(next.slug)}
                    className="text-primary focus-visible:outline-primary flex items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:outline-2"
                >
                    {next.label}
                    <ArrowRight className="size-4" aria-hidden />
                </Link>
            )}
        </footer>
    );
};
