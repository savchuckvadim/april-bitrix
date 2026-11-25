'use client';

import { Lock, TriangleAlert } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { Button } from '@workspace/ui/components/button';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';

interface ReportSettingsNoticeProps {
    /** `forbidden` — менять настройки может руководитель; `error` — настройки не загрузились. */
    kind: 'forbidden' | 'error';
    onRetry?: () => void;
}

/** Вместо формы: нет права менять настройки или они не загрузились (с повтором). */
export const ReportSettingsNotice = ({ kind, onRetry }: ReportSettingsNoticeProps) =>
    kind === 'forbidden' ? (
        <EmptyState icon={Lock} title={REPORT_SETTINGS_TEXT.forbidden} />
    ) : (
        <EmptyState
            icon={TriangleAlert}
            tone="warning"
            title={REPORT_SETTINGS_TEXT.loadFailed}
            actions={
                onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        {REPORT_SETTINGS_TEXT.retry}
                    </Button>
                )
            }
        />
    );
