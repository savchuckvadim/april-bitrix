'use client';

import type { ReactNode } from 'react';
import { CALLS_LIST_TEXT } from '@/modules/entities/calls-list';
import { PageFrame } from '@/modules/shared';
// Прямой путь, не index фичи: нужен только ряд вкладок (без загрузки отчёта).
import { ReportType } from '@/modules/feature/report-widget-type/ui/ReportType';
// Прямые пути, не index фичи: нужны две кнопки (без стора и форм настроек).
import { ReportSettingsLink } from '@/modules/feature/portal-view/ui/ReportSettingsLink';
import { SupportChatLink } from '@/modules/feature/portal-view/ui/SupportChatLink';

interface CallsListFrameProps {
    /** Сколько разборов нашлось; ещё не известно — null. */
    total: number | null;
    children: ReactNode;
}

/**
 * Каркас страницы: облегчённая шапка — название раздела с числом разборов,
 * справа «Настройки отчёта» (руководителю группы и выше) и «Поддержка» (если
 * ссылка настроена); под ней тот же ряд вкладок, что в отчёте («Разборы
 * звонков» среди них активна, остальные ведут в отчёт на свою вкладку).
 *
 * Периода в шапке нет намеренно: у списка разборов он свой, в строке
 * фильтров, — период отчёта рядом с ним давал бы на странице две разные даты.
 */
export const CallsListFrame = ({ total, children }: CallsListFrameProps) => (
    <PageFrame
        title={CALLS_LIST_TEXT.title}
        note={total !== null ? total.toLocaleString('ru-RU') : undefined}
        actions={
            <>
                <ReportSettingsLink from="calls" />
                <SupportChatLink />
            </>
        }
        tabs={<ReportType page="calls" />}
    >
        {children}
    </PageFrame>
);
