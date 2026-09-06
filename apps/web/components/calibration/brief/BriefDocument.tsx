import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { CALIBRATION_BRIEF } from '@/lib/calibration/brief-content';
import { CalibrationBlockList } from '../CalibrationBlockList';
import { DownloadBriefButton } from '../DownloadBriefButton';
import { BriefPrintButton } from './BriefPrintButton';
import { BriefPrintStyles } from './BriefPrintStyles';
import { BriefSectionBlock } from './BriefSectionBlock';

/** Бриф целиком: шапка с действиями, разделы и подписи */
export const BriefDocument: React.FC = () => (
    <article className="brief-document mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <BriefPrintStyles />

        <div className="no-print mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="ghost" size="lg">
                <Link href="/calibration">
                    <ArrowLeft className="h-4 w-4" />
                    К странице калибровки
                </Link>
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <BriefPrintButton />
                <DownloadBriefButton
                    label="Скачать файлом"
                    variant="outline"
                />
            </div>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
            {CALIBRATION_BRIEF.title}
        </h1>

        <div className="mb-10">
            <CalibrationBlockList blocks={CALIBRATION_BRIEF.intro} />
        </div>

        <div className="space-y-10">
            {CALIBRATION_BRIEF.sections.map((section, index) => (
                <BriefSectionBlock key={index} section={section} />
            ))}
        </div>

        <div className="mt-10 brief-section">
            <CalibrationBlockList blocks={CALIBRATION_BRIEF.outro} />
        </div>
    </article>
);
