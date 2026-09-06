import React from 'react';
import { HowBlockList } from '../../../components/blocks/HowBlockList';
import { CALIBRATION_BRIEF } from '../constants/brief-document';
import { CalibrationBriefActions } from './CalibrationBriefActions';
import { CalibrationBriefPrintStyles } from './CalibrationBriefPrintStyles';
import { CalibrationBriefSection } from './CalibrationBriefSection';

/** Бриф целиком: действия, шапка, разделы и подписи. */
export const CalibrationBriefDocument: React.FC = () => (
    <article className="brief-document mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <CalibrationBriefPrintStyles />

        <CalibrationBriefActions />

        <h1 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
            {CALIBRATION_BRIEF.title}
        </h1>

        <div className="mb-10">
            <HowBlockList blocks={CALIBRATION_BRIEF.intro} />
        </div>

        <div className="space-y-10">
            {CALIBRATION_BRIEF.sections.map((section) => (
                <CalibrationBriefSection
                    key={section.title}
                    section={section}
                />
            ))}
        </div>

        <div className="brief-section mt-10">
            <HowBlockList blocks={CALIBRATION_BRIEF.outro} />
        </div>
    </article>
);
