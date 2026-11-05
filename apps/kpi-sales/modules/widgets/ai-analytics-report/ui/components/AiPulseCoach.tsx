'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_PULSE_MANAGER_MIN_N_FALLBACK,
    AI_PULSE_TEXT,
    type AiPulse,
} from '@/modules/entities/ai-analytics';
import { aiPulseCoachRows, type AiPulseCoachTone } from '../../lib/ai-pulse-coach.util';
import { AiCardLink } from './AiCardLink';
import { AiManagerName } from './AiManagerName';

interface AiPulseCoachProps {
    pulse: AiPulse;
    /** Порог длительности для пустого состояния; null — не известен. */
    minDurationSec: number | null;
}

const T = AI_PULSE_TEXT;

const TONE_BADGE: Record<AiPulseCoachTone, 'warning' | 'success' | 'muted'> = {
    below: 'warning',
    best: 'success',
    level: 'muted',
};

/**
 * «С кем поработать»: менеджеры от слабого к сильному по договорённостям с
 * датой. Ниже отдела — два свежих звонка без даты, разобрать вместе;
 * лучшему — звонок-образец для остальных (решение владельца 05.11.2026).
 */
export const AiPulseCoach = ({ pulse, minDurationSec }: AiPulseCoachProps) => {
    const rows = aiPulseCoachRows(pulse);
    const managerMinN = pulse.managerMinN ?? AI_PULSE_MANAGER_MIN_N_FALLBACK;

    return (
        <section>
            <h4 className="mb-2 text-sm font-medium">
                <HintTooltip title={T.coach.hint.title} lines={[...T.coach.hint.lines]}>
                    <span className="cursor-help border-b border-dashed border-muted-foreground/60">
                        {T.coach.title}
                    </span>
                </HintTooltip>
            </h4>
            {rows.length === 0 ? (
                <p className="py-2 text-xs text-muted-foreground">
                    {T.managers.empty(pulse.window.from, pulse.window.to, managerMinN, minDurationSec)}
                </p>
            ) : (
                <ul className="space-y-2">
                    {rows.map(row => (
                        <li
                            key={row.managerId}
                            className="space-y-1 rounded-md border border-border/60 p-3 text-sm"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <AiManagerName managerId={row.managerId} className="font-medium" />
                                {row.share && (
                                    <ToneBadge tone={TONE_BADGE[row.tone]} variant="soft" size="sm">
                                        {row.share}
                                    </ToneBadge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{row.advice}</p>
                            {(row.noDateLinks.length > 0 || row.exampleLink) && (
                                <div className="flex flex-wrap gap-3 text-xs">
                                    {row.noDateLinks.map((link, index) => (
                                        <AiCardLink
                                            key={link}
                                            href={link}
                                            label={T.coach.callLink(index + 1)}
                                            title={T.coach.linkTitle}
                                        />
                                    ))}
                                    {row.exampleLink && (
                                        <AiCardLink
                                            href={row.exampleLink}
                                            label={T.coach.exampleLink}
                                            title={T.coach.linkTitle}
                                        />
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};
