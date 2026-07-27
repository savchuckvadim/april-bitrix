// Фича «публичные ссылки на отчёт»: снимок фильтра → токен → read-only
// страница /share/[token] для неавторизованных.
export { reportLinksActions, reportLinksReducer } from './model/report-links-slice';
export {
    fetchShareLinks,
    createShareLink,
    revokeShareLink,
    refreshShareLink,
    toggleShareLinkRefreshable,
    buildShareUrl,
    SHARE_LINK_MAX_LIFETIME_DAYS,
    SHARE_LINK_MAX_REFRESHABLE_RANGE_DAYS,
} from './model/report-links-thunks';
export { useReportLinks } from './model/useReportLinks';
export { startReportLinksListener } from './model/listeners/report-links.listener';
export { buildShareFilterSnapshot } from './lib/build-snapshot.util';
export type { ShareUiBlob } from './model/share-ui-blob';
export { ShareLinksControl } from './ui/ShareLinksControl';
