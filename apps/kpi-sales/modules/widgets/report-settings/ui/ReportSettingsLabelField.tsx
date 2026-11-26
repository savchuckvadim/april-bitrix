'use client';

import { X } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';
import { Input } from '@workspace/ui/components/input';
import { PORTAL_VIEW_LABEL_MAX_LENGTH } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';

interface ReportSettingsLabelFieldProps {
    /** Своё название, как набрано; пустое — исходное. */
    value: string;
    /** Что будет без своего названия: исходное название или подпись по умолчанию. */
    placeholder: string;
    /** Подпись поля для экранного диктора. */
    ariaLabel: string;
    onChange: (value: string) => void;
    onReset: () => void;
}

/**
 * Поле своего названия: в подсказке поля — то, что покажется без своего;
 * крестик «вернуть исходное» виден, пока своё набрано. Длина — до предела
 * бэка, пробелы по краям убираются при сохранении.
 */
export const ReportSettingsLabelField = ({
    value,
    placeholder,
    ariaLabel,
    onChange,
    onReset,
}: ReportSettingsLabelFieldProps) => (
    <div className="flex min-w-0 items-center gap-1">
        <Input
            value={value}
            placeholder={placeholder}
            maxLength={PORTAL_VIEW_LABEL_MAX_LENGTH}
            aria-label={ariaLabel}
            onChange={event => onChange(event.target.value)}
            className="h-8"
        />
        {value === '' ? (
            <span className="size-6 shrink-0" aria-hidden />
        ) : (
            <IconAction
                icon={X}
                label={REPORT_SETTINGS_TEXT.labels.reset}
                onClick={onReset}
            />
        )}
    </div>
);
