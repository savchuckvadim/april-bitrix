/**
 * Раздел «Бейджики» карточки портала: готовые формулировки для комментария
 * отчёта и названия события. Режим «общие по умолчанию» / «свои», редактор
 * своего набора. Хранится на бэке (`admin/portal/:portalId/badges`).
 */
export { PortalBadgesPanel } from './ui/PortalBadgesPanel/PortalBadgesPanel';
export * from './model';
export { BadgesHelper } from './lib/api/badges-helper';
export * from './lib/hooks/use-badges';
export * from './lib/badges-draft';
export { BADGES_TEXT } from './consts/badges.const';
