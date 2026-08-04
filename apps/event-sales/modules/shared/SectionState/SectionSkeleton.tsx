'use client';

import { FC } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';

interface SectionSkeletonProps {
    /** Заголовок показываем сразу: место секции видно до её загрузки. */
    title: string;
    rows?: number;
}

/** Заглушка секции на время загрузки её кода (fallback для next/dynamic). */
export const SectionSkeleton: FC<SectionSkeletonProps> = ({
    title,
    rows = 3,
}) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2" aria-busy>
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="h-12 animate-pulse rounded-md bg-muted"
                />
            ))}
        </CardContent>
    </Card>
);
