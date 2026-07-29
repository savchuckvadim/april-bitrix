'use client';

interface CompositionCheckboxListProps {
    title: string;
    items: { code: string; name: string }[];
    isChecked: (code: string) => boolean;
    onToggle: (code: string, next: boolean) => void;
}

export const CompositionCheckboxList = ({
    title,
    items,
    isChecked,
    onToggle,
}: CompositionCheckboxListProps) => (
    <div>
        <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
            {title}
        </div>
        <div className="flex flex-col gap-0.5">
            {items.map(item => (
                <label
                    key={item.code}
                    className="flex items-center gap-2 text-sm"
                >
                    <input
                        type="checkbox"
                        checked={isChecked(item.code)}
                        onChange={event =>
                            onToggle(item.code, event.target.checked)
                        }
                    />
                    <span className="truncate">{item.name}</span>
                </label>
            ))}
        </div>
    </div>
);
