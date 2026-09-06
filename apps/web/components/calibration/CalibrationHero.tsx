import React from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    CALIBRATION_MATERIALS_ANCHOR,
    CALIBRATION_SUBTITLE,
    CALIBRATION_TITLE,
} from '@/lib/calibration/page-content';
import { DownloadBriefButton } from './DownloadBriefButton';

/** Шапка страницы: заголовок, подзаголовок и два действия */
export const CalibrationHero: React.FC = () => (
    <header className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                {CALIBRATION_TITLE}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                {CALIBRATION_SUBTITLE}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <DownloadBriefButton />
                <Button asChild size="lg" variant="outline">
                    <a href={`#${CALIBRATION_MATERIALS_ANCHOR}`}>
                        <ArrowDown className="h-4 w-4" />
                        Перейти к списку материалов
                    </a>
                </Button>
            </div>
        </div>
    </header>
);
