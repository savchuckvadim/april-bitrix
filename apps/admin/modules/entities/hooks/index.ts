/** Публичная поверхность раздела «Хуки и автоматика». */
export { HooksCatalogPanel } from './ui/HooksCatalogPanel/HooksCatalogPanel';
export { HookPage } from './ui/HookPage/HookPage';
export {
    HOOKS_QUERY_KEY,
    useHookCatalog,
    useHookEntry,
    usePortalHookOperations,
    usePortalHookReadiness,
    usePortalHooksReadiness,
} from './lib/hooks';
export { resolveHookLink } from './lib/hooks-view';
export { HOOKS_TEXT } from './consts/hooks.const';
export type {
    HookCatalogEntry,
    HookCatalogItem,
    PortalHookReadiness,
    PortalHooksReadinessResponse,
} from './model';
