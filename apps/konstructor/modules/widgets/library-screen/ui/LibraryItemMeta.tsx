interface LibraryItemMetaProps {
    lines: string[];
}

/** Строки под заголовком карточки заготовки: состав, источник, дата и автор. */
export const LibraryItemMeta = ({ lines }: LibraryItemMetaProps) => (
    <span className="flex flex-col gap-0.5">
        {lines.map(line => (
            <span key={line}>{line}</span>
        ))}
    </span>
);
