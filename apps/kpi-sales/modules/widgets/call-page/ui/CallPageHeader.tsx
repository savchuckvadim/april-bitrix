import { ToneBadge } from '@workspace/april-ui/badges';
import {
    formatCallDate,
    formatDuration,
    type CallPageCallDto,
    type CallPageScoreDto,
} from '@/modules/entities/call-page';

interface CallPageHeaderProps {
    call: CallPageCallDto;
    score: CallPageScoreDto;
}

const LINK = 'text-sm text-primary hover:underline';

/**
 * Шапка страницы: кто, когда, какой звонок, приоритет разбора и ссылки в
 * Битрикс24. Оценки — в сводке под шапкой.
 */
export const CallPageHeader = ({ call, score }: CallPageHeaderProps) => {
    const details = [
        formatCallDate(call.startedAt),
        formatDuration(call.durationSec),
    ].filter((item): item is string => item !== null);

    return (
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <div className="min-w-0 space-y-2">
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
        </header>
    );
};
