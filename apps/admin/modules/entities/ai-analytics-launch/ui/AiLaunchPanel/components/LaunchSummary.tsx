'use client';

import { LAUNCH_TEXT } from '../../../consts/ai-analytics-launch.const';
import type { LaunchStatus } from '../../../model';
import { LaunchStateBadge } from './LaunchStateBadge';

/** Шапка панели: настройки портала и расход модели за месяц — словами. */
export const LaunchSummary = ({ status }: { status: LaunchStatus }) => (
    <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1 rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                    {LAUNCH_TEXT.settingsTitle}
                </p>
                <LaunchStateBadge state={status.settings.state} />
            </div>
            <p className="text-sm text-muted-foreground">
                {status.settings.text}
            </p>
        </div>
        <div className="space-y-1 rounded-md border bg-muted/30 p-3">
            <p className="text-sm font-medium">{LAUNCH_TEXT.costTitle}</p>
            <p className="text-sm text-muted-foreground">{status.cost.text}</p>
        </div>
    </div>
);
