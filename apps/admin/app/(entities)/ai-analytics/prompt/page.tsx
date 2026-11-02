'use client';

import { Suspense } from 'react';
import { AiPromptPage } from '@/modules/entities/ai-prompt';

/**
 * Раздел «AI-аналитика ОП → Запрос к модели»: произвольный промпт любым
 * исполнителем теми же ключами и провайдерами, что и разборы звонков.
 */
export default function AiPromptRoutePage() {
    return (
        <Suspense fallback={null}>
            <AiPromptPage />
        </Suspense>
    );
}
