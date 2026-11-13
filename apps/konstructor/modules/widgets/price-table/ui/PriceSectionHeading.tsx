import type { ReactNode } from 'react';

export interface PriceSectionHeadingProps {
    title: string;
    /** Кнопки добавления в этот раздел — на одной линии с заголовком */
    actions?: ReactNode;
}

/** Заголовок раздела шага цен («Основные», «Для сравнения») с его действиями. */
export const PriceSectionHeading = ({ title, actions }: PriceSectionHeadingProps) => (
    <div className="mt-1 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">{title}</h2>
        {actions ? <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
);
