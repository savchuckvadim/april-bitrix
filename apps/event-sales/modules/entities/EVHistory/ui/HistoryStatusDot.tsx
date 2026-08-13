'use client';

import { FC } from 'react';
import { HintTooltip } from '@workspace/april-ui';
import type { HistoryStatusView } from '../lib/history-status';

/** Исход записи истории — кружком с подписью в тултипе. */
export const HistoryStatusDot: FC<{ status: HistoryStatusView }> = ({
    status,
}) => (
    <HintTooltip title={status.label}>
        <span
            className="inline-block size-2 shrink-0 rounded-full"
            style={{ backgroundColor: status.color }}
            aria-label={status.label}
            role="img"
        />
    </HintTooltip>
);
