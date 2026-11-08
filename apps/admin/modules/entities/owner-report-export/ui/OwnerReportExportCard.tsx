'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AButton } from '@workspace/april-ui';
import { ToneBadge } from '@workspace/april-ui/badges';
import { MicroSpinner } from '@workspace/april-ui/feedback';
import { MicroSegmented, MicroSelect } from '@workspace/april-ui/fields';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { describeLaunchError } from '@/modules/entities/ai-analytics-launch/lib/launch-error';
import {
    OWNER_REPORT_EXPORT_MODES,
    OWNER_REPORT_EXPORT_MONTHS,
    OWNER_REPORT_EXPORT_TEXT as TEXT,
    type OwnerReportExportMode,
} from '../consts/owner-report-export.const';
import {
    ownerReportExportHelper,
    ownerReportFileName,
    saveBlob,
    useOwnerReportExportState,
    useStartOwnerReportExport,
} from '../lib/hooks/use-owner-report-export';
import { closedMonthOptions, fileSizeText } from '../lib/owner-report-periods';

interface OwnerReportExportCardProps {
    domain: string | undefined;
}

const STATUS_TONE = {
    queued: 'info',
    processing: 'info',
    ready: 'success',
    error: 'destructive',
} as const;

/**
 * Карточка «Отчёт собственнику: PDF»: месяц, «готовый или собрать
 * заново», кнопка. Пока сервер собирает отчёт — статус с опросом; как
 * только PDF готов — скачивается сам (если его запросили отсюда) и
 * остаётся кнопка «Скачать ещё раз» на сутки.
 */
export const OwnerReportExportCard = ({ domain }: OwnerReportExportCardProps) => {
    const months = useMemo(
        () => closedMonthOptions(new Date(), OWNER_REPORT_EXPORT_MONTHS),
        [],
    );
    const [periodKey, setPeriodKey] = useState(months[0]?.value ?? '');
    const [mode, setMode] = useState<OwnerReportExportMode>(
        OWNER_REPORT_EXPORT_MODES.ready,
    );
    const [error, setError] = useState<string | null>(null);
    const target = domain && periodKey ? { domain, periodKey } : null;
    const state = useOwnerReportExportState(target);
    const start = useStartOwnerReportExport();
    /** Скачать сам, когда станет ready: только то, что запросили здесь. */
    const pendingDownload = useRef<string | null>(null);

    const download = async () => {
        if (!target) return;
        setError(null);
        try {
            const blob = await ownerReportExportHelper.file(target);
            saveBlob(blob, ownerReportFileName(target));
        } catch (cause) {
            setError(`${TEXT.downloadError}: ${describeLaunchError(cause)}`);
        }
    };

    const status = state.data?.status;
    useEffect(() => {
        const key = target ? `${target.domain}:${target.periodKey}` : null;
        if (status === 'ready' && key && pendingDownload.current === key) {
            pendingDownload.current = null;
            void download();
        }
        // download замыкает тот же target, что и key
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, target?.domain, target?.periodKey]);

    const running = status === 'queued' || status === 'processing';

    const onStart = () => {
        if (!target) return;
        setError(null);
        pendingDownload.current = `${target.domain}:${target.periodKey}`;
        start.mutate(
            {
                target,
                forceRefresh: mode === OWNER_REPORT_EXPORT_MODES.rebuild,
            },
            { onError: cause => setError(describeLaunchError(cause)) },
        );
    };

    return (
        <SectionCard
            title={TEXT.title}
            description={TEXT.description}
            actions={
                status ? (
                    <ToneBadge tone={STATUS_TONE[status]} variant="soft">
                        {TEXT.status[status]}
                    </ToneBadge>
                ) : undefined
            }
        >
            {!domain ? (
                <p className="text-sm text-muted-foreground">{TEXT.noDomain}</p>
            ) : (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <MicroSelect
                            ariaLabel={TEXT.period}
                            value={periodKey}
                            options={months}
                            onChange={setPeriodKey}
                            disabled={running}
                        />
                        <MicroSegmented
                            ariaLabel={TEXT.mode}
                            value={mode}
                            onChange={value =>
                                setMode(value as OwnerReportExportMode)
                            }
                            options={[
                                {
                                    value: OWNER_REPORT_EXPORT_MODES.ready,
                                    label: TEXT.modes.ready,
                                },
                                {
                                    value: OWNER_REPORT_EXPORT_MODES.rebuild,
                                    label: TEXT.modes.rebuild,
                                },
                            ]}
                        />
                        <AButton
                            title={TEXT.start}
                            isActive={!!target && !running && !start.isPending}
                            clickHendler={onStart}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {TEXT.modeHint}
                    </p>
                    {running && (
                        <p className="inline-flex items-center gap-2 text-sm">
                            <MicroSpinner />
                            {TEXT.status[status]}
                        </p>
                    )}
                    {status === 'ready' && (
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span>
                                {TEXT.readyAt(fileSizeText(state.data?.sizeBytes))}
                            </span>
                            <AButton
                                title={TEXT.download}
                                size="small"
                                clickHendler={() => void download()}
                            />
                        </div>
                    )}
                    {status === 'error' && state.data?.message && (
                        <p className="text-sm text-destructive">
                            {state.data.message}
                        </p>
                    )}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
            )}
        </SectionCard>
    );
};
