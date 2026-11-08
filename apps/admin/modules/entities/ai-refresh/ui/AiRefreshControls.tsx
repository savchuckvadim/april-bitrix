'use client';

import { useMemo, useState } from 'react';
import { AButton } from '@workspace/april-ui';
import { MicroSegmented, MicroSelect } from '@workspace/april-ui/fields';
import { closedMonthOptions } from '@/modules/entities/owner-report-export/lib/owner-report-periods';
import {
    AI_REFRESH_MODES,
    AI_REFRESH_MONTHS,
    AI_REFRESH_TEXT as TEXT,
    type AiRefreshMode,
} from '../consts/ai-refresh.const';
import type { AiRefreshStartInput } from '../lib/api/ai-refresh-helper';

interface AiRefreshControlsProps {
    title: string;
    disabled: boolean;
    onStart: (input: AiRefreshStartInput) => void;
}

/** Месяц, «переразобрать или как есть» и кнопка запуска. */
export const AiRefreshControls = ({
    title,
    disabled,
    onStart,
}: AiRefreshControlsProps) => {
    const months = useMemo(
        () => closedMonthOptions(new Date(), AI_REFRESH_MONTHS),
        [],
    );
    const [monthKey, setMonthKey] = useState(months[0]?.value ?? '');
    const [mode, setMode] = useState<AiRefreshMode>(
        AI_REFRESH_MODES.withReanalysis,
    );
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
                <MicroSelect
                    ariaLabel={TEXT.month}
                    value={monthKey}
                    options={months}
                    onChange={setMonthKey}
                    disabled={disabled}
                />
                <MicroSegmented
                    ariaLabel={TEXT.mode}
                    value={mode}
                    onChange={value => setMode(value as AiRefreshMode)}
                    options={[
                        {
                            value: AI_REFRESH_MODES.withReanalysis,
                            label: TEXT.modes.withReanalysis,
                        },
                        {
                            value: AI_REFRESH_MODES.savedOnly,
                            label: TEXT.modes.savedOnly,
                        },
                    ]}
                />
                <AButton
                    title={title}
                    isActive={!disabled && !!monthKey}
                    clickHendler={() =>
                        onStart({
                            monthKey,
                            withReanalysis:
                                mode === AI_REFRESH_MODES.withReanalysis,
                        })
                    }
                />
            </div>
            <p className="text-xs text-muted-foreground">{TEXT.modeHint}</p>
        </div>
    );
};
