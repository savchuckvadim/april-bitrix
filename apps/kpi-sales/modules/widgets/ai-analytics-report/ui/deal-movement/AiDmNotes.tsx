'use client';

interface AiDmNotesProps {
    notes: readonly string[];
}

/** Пояснения сервера к статусам: счёта нет, часть ночей без сумм и т. п. */
export const AiDmNotes = ({ notes }: AiDmNotesProps) =>
    notes.length ? (
        <ul className="space-y-1 text-xs text-muted-foreground">
            {notes.map(note => (
                <li key={note}>{note}</li>
            ))}
        </ul>
    ) : null;
