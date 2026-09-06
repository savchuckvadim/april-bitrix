import React from 'react';
import Link from 'next/link';
import { Printer } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { CALIBRATION_FINAL_SECTIONS } from '@/lib/calibration/page-content';
import { CalibrationBlockList } from './CalibrationBlockList';
import { DownloadBriefButton } from './DownloadBriefButton';

/**
 * Финальный блок: как отправить материалы (там же контакты) и что сделать
 * на этой неделе. Контакты приходят из `CALIBRATION_CONTACTS` — заменять их
 * нужно в одном месте.
 */
export const CalibrationCta: React.FC = () => (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-8">
        <div className="space-y-10">
            {CALIBRATION_FINAL_SECTIONS.map((section) => (
                <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-8"
                >
                    <h2 className="mb-5 text-2xl font-bold text-foreground sm:text-3xl">
                        {section.title}
                    </h2>
                    <CalibrationBlockList blocks={section.blocks} />
                </section>
            ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <DownloadBriefButton />
            <Button asChild size="lg" variant="outline">
                <Link href="/calibration/brief">
                    <Printer className="h-4 w-4" />
                    Версия для печати
                </Link>
            </Button>
        </div>
    </div>
);
