'use client';

import {
    Tooltip as TooltipPrimitive,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { ReactNode } from 'react';

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    className?: string;
}

export const Tooltip = ({
    children,
    content,
    side = 'top',
    align = 'center',
    delayDuration = 300,
    className,
}: TooltipProps) => {
    return (
        <TooltipProvider>
            <TooltipPrimitive delayDuration={delayDuration}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className={`${className} `}
                >
                    {content}
                </TooltipContent>
            </TooltipPrimitive>
        </TooltipProvider>
    );
};
