'use client';

import type { ReactNode } from 'react';
import { PageFrame } from '@/modules/shared';
// Прямой путь, не index фичи: нужен только ряд вкладок (без загрузки отчёта).
import { ReportType } from '@/modules/feature/report-widget-type/ui/ReportType';
// Прямой путь, не index фичи: нужна одна кнопка (без стора и форм настроек).
import { SupportChatLink } from '@/modules/feature/portal-view/ui/SupportChatLink';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import { ReportSettingsBack } from './ReportSettingsBack';

/**
 * Каркас страницы настроек: облегчённая шапка — стрелка «назад», название,
 * справа «Поддержка» (если ссылка настроена); под ней ряд вкладок отчёта —
 * ни одна не активна, все ведут в отчёт или в «Разборы звонков».
 */
export const ReportSettingsFrame = ({ children }: { children: ReactNode }) => (
    <PageFrame
        title={REPORT_SETTINGS_TEXT.title}
        back={<ReportSettingsBack />}
        actions={<SupportChatLink />}
        tabs={<ReportType page="settings" />}
    >
        {children}
    </PageFrame>
);
