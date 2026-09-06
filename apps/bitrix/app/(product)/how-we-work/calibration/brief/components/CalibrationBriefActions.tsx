import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    CALIBRATION_BRIEF_FILE,
    CALIBRATION_PATH,
} from '../../../constants/calibration-contacts';
import { CalibrationBriefPrintButton } from './CalibrationBriefPrintButton';

/** Действия над брифом: назад к калибровке, печать, скачивание файла. */
export const CalibrationBriefActions: React.FC = () => (
    <div className="no-print mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" size="lg">
            <Link href={CALIBRATION_PATH}>
                <ArrowLeft className="h-4 w-4" />
                К странице калибровки
            </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CalibrationBriefPrintButton />
            <Button asChild variant="outline" size="lg">
                <a
                    href={CALIBRATION_BRIEF_FILE.href}
                    download={CALIBRATION_BRIEF_FILE.fileName}
                >
                    <Download className="h-4 w-4" />
                    Скачать файлом
                </a>
            </Button>
        </div>
    </div>
);
