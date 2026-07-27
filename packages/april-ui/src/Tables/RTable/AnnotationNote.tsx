'use client';
import { FC } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { RTableAnnotation } from './rtable.types';

interface AnnotationNoteProps {
    annotation: RTableAnnotation | undefined;
    /** Префикс строки («↳ » у конверсий; у планов текст уже с «⌖»). */
    prefix?: string;
}

/** Подстрока-аннотация под значением ячейки с опциональным тултипом. */
export const AnnotationNote: FC<AnnotationNoteProps> = ({
    annotation,
    prefix = '',
}) => {
    if (!annotation) return null;

    const body = (
        <div
            className={`text-xs font-medium ${annotation.className ?? 'text-muted-foreground'}`}
        >
            {prefix}
            {annotation.text}
        </div>
    );

    if (!annotation.tooltip) return body;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{body}</TooltipTrigger>
            <TooltipContent className="max-w-[320px] whitespace-pre-line text-xs">
                {annotation.tooltip}
            </TooltipContent>
        </Tooltip>
    );
};
