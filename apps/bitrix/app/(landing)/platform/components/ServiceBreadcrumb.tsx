import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PLATFORM_COPY } from '../model/copy';
import { PLATFORM_ROOT } from '../model/navigation';

export interface ServiceBreadcrumbProps {
    current: string;
}

/** Путь «Все сервисы › Сервис»: вернуться к обзору в один клик. */
export function ServiceBreadcrumb({ current }: ServiceBreadcrumbProps) {
    return (
        <nav aria-label="Навигация по разделу" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={PLATFORM_ROOT} className="hover:text-primary">
                {PLATFORM_COPY.breadcrumbRoot}
            </Link>
            <ChevronRight className="size-4" aria-hidden />
            <span className="text-foreground">{current}</span>
        </nav>
    );
}
