'use client';

import { Handshake } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';

/** Открыто из лида или карточки без сделки и компании: предложение собирается в сделке или компании. */
export const NoEntityScreen = () => (
    <EmptyState
        layout="screen"
        icon={Handshake}
        tone="warning"
        title="Конструктор работает из сделки или компании"
        description="Откройте карточку сделки или компании и запустите конструктор с её вкладки. Из лида предложение собрать нельзя: сначала переведите лид в сделку."
    />
);
