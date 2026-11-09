import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface PlatformEyebrowProps {
    className?: string;
    children: ReactNode;
}

/** Короткая подпись над заголовком: раздел или сервис, о котором речь. */
export function PlatformEyebrow({ className, children }: PlatformEyebrowProps) {
    return <p className={cn('text-sm font-medium text-primary', className)}>{children}</p>;
}
