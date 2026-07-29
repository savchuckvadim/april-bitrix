'use client';

import { AlertTriangle } from 'lucide-react';

/** PROD вне фрейма Bitrix: доступ только из портала. */
export const NonAuthScreen = () => (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <AlertTriangle className="h-10 w-10 text-warning" />
            <h1 className="text-lg font-semibold text-foreground">
                Доступ ограничен
            </h1>
            <p className="text-sm text-muted-foreground">
                Приложение доступно только внутри портала Bitrix24. Откройте
                его из меню вашего портала.
            </p>
        </div>
    </div>
);
