import type { ReactNode } from 'react';

export interface ScreenHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    /** Правый слот: кнопки, бэйджи. */
    actions?: ReactNode;
}

/** Заголовок экрана: название, пояснение, действия справа. */
export const ScreenHeader = ({ title, description, actions }: ScreenHeaderProps) => (
    <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
        </div>
        {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
    </div>
);
