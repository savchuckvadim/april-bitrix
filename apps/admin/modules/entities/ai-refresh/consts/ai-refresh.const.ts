import type { AiRefreshStepDtoState } from '@workspace/nest-admin-api';

/** Опрос сценария, пока он идёт (тик на сервере — раз в минуту). */
export const AI_REFRESH_POLL_MS = 15_000;

/** Сколько закрытых месяцев предлагать. */
export const AI_REFRESH_MONTHS = 12;

/** С переразбором звонков или по уже сохранённым разборам. */
export const AI_REFRESH_MODES = {
    withReanalysis: 'with-reanalysis',
    savedOnly: 'saved-only',
} as const;
export type AiRefreshMode =
    (typeof AI_REFRESH_MODES)[keyof typeof AI_REFRESH_MODES];

/** Цвет бейджа шага по состоянию. */
export const AI_REFRESH_STEP_TONE: Record<
    AiRefreshStepDtoState,
    'muted' | 'info' | 'success' | 'warning' | 'destructive'
> = {
    pending: 'muted',
    running: 'info',
    done: 'success',
    skipped: 'warning',
    error: 'destructive',
};

export const AI_REFRESH_TEXT = {
    title: 'Обновить всё по порядку',
    description:
        'Одна кнопка вместо шагов панели: переразбор звонков месяца → пересчёт месяца (витрина, история стадий, прогноз) → сброс кэша → прогноз (включается, только если проверка пройдена) → PDF отчёта собственнику. Каждый шаг ждёт предыдущий; страницу можно закрыть — сервер доведёт сам. Клиенту ничего не отправляется.',
    month: 'Месяц',
    mode: 'Звонки',
    modes: {
        withReanalysis: 'Переразобрать',
        savedOnly: 'Как есть',
    },
    modeHint:
        '«Переразобрать» — сначала бесплатный подсчёт, потом переразбор текущей версией (не больше 1500 звонков, иначе шаг остановится и попросит запустить вручную). «Как есть» — по уже сохранённым разборам.',
    start: 'Обновить всё',
    stepState: {
        pending: 'Ждёт',
        running: 'Идёт',
        done: 'Готово',
        skipped: 'Пропущен',
        error: 'Сорвался',
    },
    running: (step: number, total: number) => `Идёт шаг ${step} из ${total}`,
    finished: 'Закончено',
    finishedWithErrors: 'Закончено, есть сорвавшиеся шаги',
    notStarted: 'Ещё не запускали на этом портале.',
    startedAt: (month: string, at: string) => `Месяц ${month}, запуск ${at}`,
    noDomain: 'У портала нет домена — обновлять нечего.',
    portals: {
        title: 'Обновить всё: порталы',
        description:
            'Порталы с включённой AI-аналитикой и их последние сценарии «обновить всё». Можно запустить на всех сразу: где сценарий уже идёт — он не трогается.',
        startAll: 'Обновить все порталы',
        empty: 'Порталов с включённой AI-аналитикой нет.',
        open: 'Открыть AI портала',
        startedAll: (count: number) =>
            `Запущено на порталах: ${count}. Ход — ниже, обновляется сам.`,
    },
} as const;
