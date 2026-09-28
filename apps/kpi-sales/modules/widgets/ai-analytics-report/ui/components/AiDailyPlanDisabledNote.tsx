'use client';

/** Гейт настройки портала: план дня выключен — запрос не отправляем. */
export const AiDailyPlanDisabledNote = () => (
    <p className="py-2 text-xs text-muted-foreground">
        План дня на портале выключен. Чтобы включить — попросите
        разработчика.
    </p>
);
