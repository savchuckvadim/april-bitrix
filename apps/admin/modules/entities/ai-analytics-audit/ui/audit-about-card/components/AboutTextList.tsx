interface AboutTextListProps {
    title: string;
    items: readonly string[];
}

/** Подзаголовок + маркированный список строк самоописания. */
export const AboutTextList = ({ title, items }: AboutTextListProps) => (
    <div className="space-y-1.5">
        <h4 className="text-sm font-semibold">{title}</h4>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {items.map(item => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);
