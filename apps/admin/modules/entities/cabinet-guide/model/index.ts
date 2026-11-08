import type { GuideCheck, GuideLinkItem } from '@/modules/shared/ui/guide';

/**
 * Путеводитель «Кабинет клиента» (бэк: apps/admin → @lib/cabinet
 * `GET admin/cabinet/guide`). Тексты и чек-лист — с бэка, фронт показывает.
 */
export interface CabinetGuideSection {
    key: string;
    title: string;
    /** Markdown (подмножество GFM). */
    markdown: string;
}

/** Сколько подключено. */
export interface CabinetGuideCounters {
    portals: number;
    portalsWithClient: number;
    portalsWithOwner: number;
    members: number;
    pending: number;
    telegramBindings: number;
}

export interface CabinetGuide {
    summary: string;
    /** null — таблицы кабинета ещё не созданы (миграции не применены). */
    counters: CabinetGuideCounters | null;
    checklist: GuideCheck[];
    sections: CabinetGuideSection[];
    links: GuideLinkItem[];
}
