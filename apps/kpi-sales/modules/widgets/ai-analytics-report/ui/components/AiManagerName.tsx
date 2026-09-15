'use client';

import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
import { useAiManagerLink } from '../../hooks/use-ai-manager-link';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';

interface AiManagerNameProps {
    managerId: string;
    className?: string;
}

/** Имя менеджера ссылкой на его отчёт (на публичном снимке — текстом). */
export const AiManagerName = ({ managerId, className }: AiManagerNameProps) => {
    const managerName = useAiManagerName();
    const managerLink = useAiManagerLink();
    const href = managerLink(managerId);
    const name = managerName(managerId);

    return href ? (
        <Link
            href={href}
            className={cn(
                'font-medium text-primary hover:underline',
                className,
            )}
        >
            {name}
        </Link>
    ) : (
        <span className={cn('font-medium', className)}>{name}</span>
    );
};
