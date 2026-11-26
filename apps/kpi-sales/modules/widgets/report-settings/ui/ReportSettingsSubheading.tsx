import type { ReactNode } from 'react';

interface ReportSettingsSubheadingProps {
    children: ReactNode;
}

/** Подзаголовок группы строк внутри карточки настроек — мелко, с чертой снизу. */
export const ReportSettingsSubheading = ({ children }: ReportSettingsSubheadingProps) => (
    <h4 className="mb-1 border-b pb-1 text-xs font-semibold tracking-wide uppercase">
        {children}
    </h4>
);
