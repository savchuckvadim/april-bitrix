import { ToneBadge } from '@workspace/april-ui/badges';
import {
    formatCallDate,
    formatDuration,
    formatScore,
    scoreTone,
    type CallPageCallDto,
    type CallPageScoreDto,
} from '@/modules/entities/call-page';

interface CallPageHeaderProps {
    call: CallPageCallDto;
    score: CallPageScoreDto;
}

const LINK = 'text-sm text-primary hover:underline';

/**
 * Шапка страницы: кто, когда, какой звонок, приоритет разбора, ссылки в
 * Битрикс24 и крупно — оценка звонка (видна с первого взгляда, решение
 * владельца 17.11.2026). Оценки разделов — в сводке под шапкой.
 */
export const CallPageHeader = ({ call, score }: CallPageHeaderProps) => {
    const details = [
        formatCallDate(call.startedAt),
        formatDuration(call.durationSec),
    ].filter((item): item is string => item !== null);

    return (
        <header className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold">
                        {call.managerName ?? 'Разбор звонка'}
                    </h1>
                    {call.callTypeTitle && (
                        <ToneBadge tone="primary" variant="soft">
                            {call.callTypeTitle}
                        </ToneBadge>
                    )}
                    {score.coachingTitle && (
                        <ToneBadge tone="warning" variant="soft">
                            {score.coachingTitle}
                        </ToneBadge>
                    )}
                </div>
                {details.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                        {details.join(' · ')}
                    </p>
                )}
                {call.callTypeReason && (
                    <p className="text-sm text-muted-foreground">
                        {call.callTypeReason}
                    </p>
                )}
                {(call.smartUrl || call.crmUrl) && (
                    <div className="flex flex-wrap gap-4">
                        {call.smartUrl && (
                            <a
                                className={LINK}
                                href={call.smartUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Карточка разбора в Битрикс24 →
                            </a>
                        )}
                        {call.crmUrl && (
                            <a
                                className={LINK}
                                href={call.crmUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Клиент в Битрикс24 →
                            </a>
                        )}
                    </div>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Оценка звонка</p>
                    <p className="text-xs text-muted-foreground">от 1 до 10</p>
                </div>
                <ToneBadge
                    tone={scoreTone(score.score)}
                    className="px-3 py-1 text-2xl font-semibold"
                >
                    {formatScore(score.score)}
                </ToneBadge>
            </div>
        </header>
    );
};
