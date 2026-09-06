import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { CALIBRATION_BRIEF_FILE } from '@/lib/calibration/contacts';

interface DownloadBriefButtonProps {
    /** Подпись кнопки */
    label?: string;
    /** Оформление кнопки */
    variant?: 'default' | 'outline';
}

/**
 * Кнопка «Скачать бриф» — прямая ссылка на файл в `public/`.
 * Атрибут `download` заставляет браузер сохранить файл, а не открыть его.
 */
export const DownloadBriefButton: React.FC<DownloadBriefButtonProps> = ({
    label = 'Скачать бриф',
    variant = 'default',
}) => (
    <Button asChild size="lg" variant={variant}>
        <a
            href={CALIBRATION_BRIEF_FILE.href}
            download={CALIBRATION_BRIEF_FILE.fileName}
        >
            <Download className="h-4 w-4" />
            {label}
        </a>
    </Button>
);
