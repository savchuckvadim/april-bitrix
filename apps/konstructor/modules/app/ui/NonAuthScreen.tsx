'use client';

import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';

/** PROD вне фрейма Bitrix: доступ только из портала. */
export const NonAuthScreen = () => (
    <EmptyState
        layout="screen"
        icon={AlertTriangle}
        tone="warning"
        title="Доступ ограничен"
        description="Приложение доступно только внутри портала Bitrix24. Откройте его из меню вашего портала."
    />
);
