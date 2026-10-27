/**
 * Каталог бейджиков: готовые формулировки для комментария отчёта и названия
 * события, заданные порталом (общий набор из кода или свой из админки) и
 * приезжающие во фрейм с бэка (`GET /api/badges`).
 *
 * Раскладка слайса:
 * - `lib/api/badge-catalog-helper.ts` — единственное место, знающее транспорт;
 * - `lib/badge-catalog-normalize.ts` — DTO → доменный тип с отсевом
 *   нераспознанного;
 * - `lib/badge-visibility.ts` — чистые правила показа и применения;
 * - `model/*` — слайс, thunk, селекторы, листенер автоподстановки названия.
 *
 * Загружает каталог init-цикл (`ensureBadgeCatalog` в app-init рядом с
 * каталогом анкет); состав перечитывается по смене домена и расхождению
 * хэша, ⟳ лишнего запроса не даёт. На ⟳ каталог не сбрасывается.
 *
 * UI — в features/CommentBadges и features/TitleBadges.
 */
export * from './model/badge-catalog.type';
export * from './model/BadgeCatalogSlice';
export * from './model/BadgeCatalogThunk';
export * from './model/selectors';
export { startBadgeTitleListener } from './model/badge-title-listener';
export { startBadgePresentationCommentListener } from './model/badge-presentation-listener';
export {
    applyBadgeToComment,
    composeEventTitle,
    filterCommentBadges,
    filterTitleBadges,
    findDefaultTitleBadge,
} from './lib/badge-visibility';
export { normalizeBadgeCatalog } from './lib/badge-catalog-normalize';
export { resolveAutoTitle } from './lib/badge-auto-title';
export { BadgeCatalogHelper } from './lib/api/badge-catalog-helper';
