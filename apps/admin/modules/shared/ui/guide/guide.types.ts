/**
 * Пункт чек-листа путеводителя («что осталось, чтобы заработало»):
 * done — сделано (видно по настройкам), todo — не сделано,
 * manual — админка проверить не может, как проверить — в подсказке.
 * Общий для путеводителей «Поддержка» и «Кабинет клиента».
 */
export type GuideCheckStatus = 'done' | 'todo' | 'manual';

export interface GuideLinkItem {
    title: string;
    /** Путь админки (`/client`) или внешний адрес. */
    href: string;
}

export interface GuideCheck {
    key: string;
    title: string;
    status: GuideCheckStatus;
    /** Что сделать или как проверить. Markdown. */
    hint: string;
    link: GuideLinkItem | null;
}
