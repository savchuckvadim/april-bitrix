'use client';

import { AudioLines } from 'lucide-react';
import { useAiCallPageLink } from '../../hooks/use-ai-call-page-link';

interface AiCallPageLinkProps {
    transcriptionId: string | null | undefined;
    /** Подпись ссылки; по умолчанию «Страница разбора». */
    label?: string;
    className?: string;
}

export const AI_CALL_PAGE_LINK_LABEL = 'Страница разбора';
export const AI_CALL_PAGE_LINK_TITLE =
    'Открыть страницу разбора звонка: расшифровка, запись и места разбора в тексте';

/**
 * Ссылка на страницу разбора звонка на сайте «Отчёта» — рядом со ссылкой на
 * карточку в Битрикс24. Пока ссылка грузится или её нет (нет разбора, звонок
 * вне периметра пользователя), ничего не показывает.
 */
export const AiCallPageLink = ({
    transcriptionId,
    label = AI_CALL_PAGE_LINK_LABEL,
    className = 'inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline',
}: AiCallPageLinkProps) => {
    const url = useAiCallPageLink(transcriptionId);
    if (!url) return null;
    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={className}
            title={AI_CALL_PAGE_LINK_TITLE}
        >
            <AudioLines className="h-3 w-3" />
            {label}
        </a>
    );
};
