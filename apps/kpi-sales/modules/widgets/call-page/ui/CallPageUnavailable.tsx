interface CallPageUnavailableProps {
    /** not-found — ссылка не открылась; error — страница не загрузилась. */
    reason: 'not-found' | 'error';
}

const TEXTS = {
    'not-found': {
        title: 'Страница разбора недоступна',
        text: 'Ссылка недействительна, её отозвали или разбор этого звонка ещё не готов.',
        action: 'Откройте звонок из карточки разбора в Битрикс24 — там всегда действующая ссылка.',
    },
    error: {
        title: 'Страница не загрузилась',
        text: 'Не получилось получить разбор звонка.',
        action: 'Обновите страницу через минуту. Если не поможет — напишите в поддержку April.',
    },
} as const;

/** Заглушка вместо страницы звонка: что случилось и что сделать. */
export const CallPageUnavailable = ({ reason }: CallPageUnavailableProps) => {
    const texts = TEXTS[reason];
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
            <h1 className="text-2xl font-semibold">{texts.title}</h1>
            <p className="text-muted-foreground">{texts.text}</p>
            <p className="text-sm text-muted-foreground">{texts.action}</p>
        </div>
    );
};
