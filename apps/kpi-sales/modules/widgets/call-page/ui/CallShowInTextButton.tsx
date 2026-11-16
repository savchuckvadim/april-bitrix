'use client';

interface CallShowInTextButtonProps {
    /** Подсветка места в расшифровке; null — места нет, кнопка не рисуется. */
    highlightId: string | null;
    onOpen: (id: string | null) => void;
}

/** «Показать в разговоре»: ведёт к реплике и включает запись с этого места. */
export const CallShowInTextButton = ({
    highlightId,
    onOpen,
}: CallShowInTextButtonProps) => {
    if (highlightId === null) return null;
    return (
        <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => onOpen(highlightId)}
        >
            Показать в разговоре →
        </button>
    );
};
