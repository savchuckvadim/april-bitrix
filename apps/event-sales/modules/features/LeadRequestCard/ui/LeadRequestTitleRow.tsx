'use client';

import { FC } from 'react';
import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getSafeExternalUrl } from '@/modules/app/lib/utills/url';
import {
    RELATED_ENTITY_TYPE,
    getEntityCardUrl,
} from '@/modules/entities/RelatedCrm';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

interface LeadRequestTitleRowProps {
    title: string;
    /** Лид карточки — название ведёт на его карточку CRM в новой вкладке. */
    leadId: number;
    questUrl: string | null;
    regNumber: string | null;
    /** Слот сразу за названием (полоска стадии) — в ту же строку. */
    afterTitle?: ReactNode;
}

/**
 * Название лида (ссылкой на карточку CRM) + слот стадии + ссылка «Оценка»
 * + код партнёра. Название жёстко ограничено по ширине (лидоген генерит
 * простыни вида «TEEST(888888888)…») — полное видно по наведению.
 */
export const LeadRequestTitleRow: FC<LeadRequestTitleRowProps> = ({
    title,
    leadId,
    questUrl,
    regNumber,
    afterTitle,
}) => {
    const domain = useAppSelector(s => s.app.domain);
    // Домен проверяется сборщиком: негодный → null → обычный текст без
    // мёртвой ссылки (правило единой сборки ссылок).
    const leadUrl = getEntityCardUrl(domain, RELATED_ENTITY_TYPE.LEAD, leadId);
    // questUrl — сырое UF-поле лида: относительный путь открыл бы соседнее
    // приложение текущего хоста. Мусор → кнопки «Оценка» просто нет.
    const safeQuestUrl = getSafeExternalUrl(questUrl);

    return (
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {leadUrl ? (
                    <a
                        href={leadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Открыть в новой вкладке: ${title}`}
                        className="inline-flex min-w-0 max-w-56 items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                    >
                        <span className="min-w-0 truncate">{title}</span>
                        <ExternalLink
                            aria-hidden
                            className="size-3 shrink-0 text-muted-foreground"
                        />
                    </a>
                ) : (
                    <span
                        title={title}
                        className="min-w-0 max-w-56 truncate text-sm font-medium"
                    >
                        {title}
                    </span>
                )}
                {afterTitle && (
                    <div className="min-w-40 flex-1">{afterTitle}</div>
                )}
                {safeQuestUrl && (
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 shrink-0 gap-1 px-2 text-xs"
                    >
                        <a href={safeQuestUrl} target="_blank" rel="noreferrer">
                            {LEAD_REQUEST_TEXT.questLink}
                            <ExternalLink className="size-3" />
                        </a>
                    </Button>
                )}
            </div>
            {regNumber && (
                <p className="text-xs text-muted-foreground">
                    {LEAD_REQUEST_TEXT.partnerCode}: {regNumber}
                </p>
            )}
        </div>
    );
};
