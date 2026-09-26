'use client';

/** Гейт настройки портала: план дня выключен — запрос не отправляем. */
export const AiDailyPlanDisabledNote = () => (
    <p className="py-2 text-xs text-muted-foreground">
        План дня выключен на портале (настройка{' '}
        <code className="rounded bg-muted px-1">
            ai_analytics_daily_plan_enabled
        </code>
        ).
    </p>
);
