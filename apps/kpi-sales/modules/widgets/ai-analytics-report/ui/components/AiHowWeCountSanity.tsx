'use client';

import { ToneBadge } from '@workspace/april-ui';
import type { AiAboutSanity } from '@/modules/entities/ai-analytics';
import {
    AI_ABOUT_DATA_QUALITY,
    formatAiAboutDate,
} from '../../lib/ai-about.util';

interface AiHowWeCountSanityProps {
    /** null — недельная проверка ещё не проводилась. */
    sanity: AiAboutSanity | null;
}

/** Недельная проверка качества данных: даты событий и предупреждения. */
export const AiHowWeCountSanity = ({ sanity }: AiHowWeCountSanityProps) => {
    if (!sanity) {
        return (
            <p className="text-xs text-muted-foreground">
                Проверка качества данных ещё не проводилась.
            </p>
        );
    }
    const quality = AI_ABOUT_DATA_QUALITY[sanity.dataQuality];

    return (
        <div className="space-y-1 text-sm">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">
                    Проверка качества данных от {formatAiAboutDate(sanity.day)}:
                </span>
                <ToneBadge tone={quality.tone} variant="soft" size="sm">
                    {quality.label}
                </ToneBadge>
            </div>
            {sanity.warnings.length ? (
                <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
                    {sanity.warnings.map((warning, index) => (
                        <li
                            key={`${sanity.warningRules[index] ?? index}-${warning}`}
                        >
                            {warning}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground">
                    Предупреждений по данным нет.
                </p>
            )}
        </div>
    );
};
