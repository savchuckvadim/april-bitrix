'use client';

import { Phone } from 'lucide-react';
import { HeaderAction } from '@/modules/shared';
import { PORTAL_VIEW_TEXT } from '../consts/portal-view.texts';
import { useSupportUrl } from '../hooks/use-portal-view';

/**
 * Кнопка-иконка «Поддержка» в шапке: чат поддержки в новой вкладке. Видна
 * только когда ссылка настроена (и прошла проверку на http/https).
 */
export const SupportChatLink = () => {
    const supportUrl = useSupportUrl();
    if (!supportUrl) return null;

    return (
        <HeaderAction
            icon={Phone}
            label={PORTAL_VIEW_TEXT.supportLink}
            hint={PORTAL_VIEW_TEXT.supportHint}
            href={supportUrl}
            external
        />
    );
};
