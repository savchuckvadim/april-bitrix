/**
 * Типы раздела «Поддержка клиентов» — зеркало DTO бэка admin
 * (`SupportGuideResponseDto`, `SupportMonitorPreviewResponseDto` из
 * @lib/support). Клиент `@workspace/nest-admin-api` не перегенерирован,
 * поэтому типы ручные, как в разделе «Хуки».
 */

export type SupportGuideCheckStatus = 'done' | 'todo' | 'manual';

export interface SupportGuideLink {
    title: string;
    href: string;
}

export interface SupportGuideCheck {
    key: string;
    title: string;
    status: SupportGuideCheckStatus;
    hint: string;
    link: SupportGuideLink | null;
}

export interface SupportGuideSection {
    key: string;
    title: string;
    markdown: string;
}

export interface SupportGuide {
    lineDomain: string;
    portalId: number | null;
    summary: string;
    checklist: SupportGuideCheck[];
    sections: SupportGuideSection[];
    links: SupportGuideLink[];
}

export type SupportSignalKind = 'new_dialog' | 'waiting' | 'escalation';

export interface SupportDialogReport {
    sessionId: number;
    chatId: number;
    lineId: number;
    clientName: string;
    clientPortal: string | null;
    operatorName: string | null;
    waitedMinutes: number;
    pendingText: string | null;
    url: string;
    crmUrl: string | null;
}

export interface SupportSignalReport {
    kind: SupportSignalKind;
    sessionId: number;
    clientName: string;
    waitedMinutes: number;
    bellText: string;
    telegramText: string;
    bellDelivered: number;
    telegramDelivered: boolean;
    remembered: boolean;
}

export interface SupportMonitorPreview {
    domain: string;
    dryRun: boolean;
    dialogs: SupportDialogReport[];
    signals: SupportSignalReport[];
    warnings: string[];
}
