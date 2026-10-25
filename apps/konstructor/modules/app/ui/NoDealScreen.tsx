'use client';

import { Handshake } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';

/** Открыто из карточки компании, а сделок у неё нет: предложение собирается в сделке. */
export const NoDealScreen = () => (
    <EmptyState
        layout="screen"
        icon={Handshake}
        tone="warning"
        title="У компании нет сделок"
        description="Конструктор работает в сделке: создайте сделку для этой компании и откройте конструктор из неё."
    />
);
