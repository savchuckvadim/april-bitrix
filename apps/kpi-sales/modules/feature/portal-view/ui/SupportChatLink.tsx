'use client';

import { Phone } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { PORTAL_VIEW_TEXT } from '../consts/portal-view.texts';
import { useSupportUrl } from '../hooks/use-portal-view';

/**
 * Кнопка-иконка «Поддержка» в шапке: чат поддержки в новой вкладке. Видна
 * только когда ссылка настроена (и прошла проверку на http/https).
 */
export const SupportChatLink = () => {
    const supportUrl = useSupportUrl();
    if (!supportUrl) return null;

    const label = PORTAL_VIEW_TEXT.supportLink;
    return (
        <Button
            asChild
            variant="outline"
            className="h-8 cursor-pointer px-3"
            title={label}
        >
            <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
            >
                <Phone />
            </a>
        </Button>
    );
};
