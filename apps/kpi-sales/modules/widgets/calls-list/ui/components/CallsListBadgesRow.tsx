import type { ReactNode } from 'react';

interface CallsListBadgesRowProps {
    /** Подпись ряда: «Общие», «Методика «…»». */
    caption: string;
    children: ReactNode;
}

/** Ряд панели бейджей: короткая подпись слева и чипы, которые переносятся. */
export const CallsListBadgesRow = ({ caption, children }: CallsListBadgesRowProps) => (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
        <span className="min-w-16 py-1 text-[0.65rem] leading-none whitespace-nowrap text-muted-foreground">
            {caption}
        </span>
        <div className="min-w-0 flex-1">{children}</div>
    </div>
);
