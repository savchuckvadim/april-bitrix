import type { ReactNode } from 'react';

interface ReportSettingsSectionHeadProps {
    title: string;
    /** Что настраивается в разделе — одним-двумя предложениями. */
    description: string;
    /** Действие раздела справа от заголовка. */
    actions?: ReactNode;
}

/** Заголовок открытого раздела настроек: название, пояснение и действие раздела. */
export const ReportSettingsSectionHead = ({
    title,
    description,
    actions,
}: ReportSettingsSectionHeadProps) => (
    <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions}
    </div>
);
