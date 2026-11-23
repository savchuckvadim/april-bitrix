'use client';

import { ExternalLink } from 'lucide-react';

export interface ContractGenerateStatusProps {
    /** Почему формирование заблокировано */
    blocker: string | null;
    error: string | null;
    isDone: boolean;
    /** Ссылка на готовый договор */
    link: string | null;
    documentName: string | null;
    /** Договор лёг на Диск Битрикса; null — формирование ещё не завершилось */
    savedToDisk: boolean | null;
}

/** Состояние формирования договора: блокер, ошибка, ссылка на результат и место хранения. */
export const ContractGenerateStatus = ({
    blocker,
    error,
    isDone,
    link,
    documentName,
    savedToDisk,
}: ContractGenerateStatusProps) => (
    <>
        {blocker ? <p className="text-xs text-muted-foreground">{blocker}</p> : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {isDone && link ? (
            <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
            >
                <ExternalLink className="h-3 w-3" />
                {documentName || 'Договор (DOCX)'}
            </a>
        ) : null}
        {isDone && savedToDisk === false ? (
            <p className="text-xs text-warning">
                Диск Битрикса недоступен: договор сохранён на сервере, в сделку ушла ссылка на него.
            </p>
        ) : isDone && savedToDisk ? (
            <p className="text-xs text-muted-foreground">На Диске Битрикса: папка сделки / «Договоры».</p>
        ) : null}
    </>
);
