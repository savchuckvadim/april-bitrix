import React from 'react';
import type { Metadata } from 'next';
import { CalibrationCta } from '@/components/calibration/CalibrationCta';
import { CalibrationFaq } from '@/components/calibration/CalibrationFaq';
import { CalibrationHero } from '@/components/calibration/CalibrationHero';
import { CalibrationSectionBlock } from '@/components/calibration/CalibrationSectionBlock';
import { CalibrationToc } from '@/components/calibration/CalibrationToc';
import {
    CALIBRATION_BODY_SECTIONS,
    CALIBRATION_FAQ_SECTION_ID,
    CALIBRATION_SECTIONS,
    CALIBRATION_SUBTITLE,
    CALIBRATION_TITLE,
} from '@/lib/calibration/page-content';

export const metadata: Metadata = {
    title: `${CALIBRATION_TITLE} — калибровка AI-аналитики звонков`,
    description: CALIBRATION_SUBTITLE,
    openGraph: {
        type: 'article',
        locale: 'ru_RU',
        title: `${CALIBRATION_TITLE} — калибровка AI-аналитики звонков`,
        description: CALIBRATION_SUBTITLE,
    },
};

export default function CalibrationPage() {
    return (
        <div className="min-h-svh bg-background">
            <CalibrationHero />

            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
                <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-12">
                    <CalibrationToc sections={CALIBRATION_SECTIONS} />

                    <div className="min-w-0 space-y-14">
                        {CALIBRATION_BODY_SECTIONS.map((section) => (
                            <CalibrationSectionBlock
                                key={section.id}
                                section={section}
                            >
                                {section.id === CALIBRATION_FAQ_SECTION_ID && (
                                    <CalibrationFaq />
                                )}
                            </CalibrationSectionBlock>
                        ))}

                        <CalibrationCta />
                    </div>
                </div>
            </div>
        </div>
    );
}
