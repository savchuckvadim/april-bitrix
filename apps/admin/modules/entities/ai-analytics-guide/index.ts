/** Публичная поверхность путеводителя по AI-аналитике ОП. */
export { AiAnalyticsGuidePage, GuideLinkButton } from './ui';
export { GUIDE_PATH, GUIDE_TEXT } from './consts/ai-analytics-guide.const';
export { buildGuideSectionHref } from './lib/guide-view';
export {
    AI_ANALYTICS_GUIDE_KEY,
    useGuideSection,
    useGuideSections,
} from './lib/hooks';
export type { GuideSection, GuideSectionItem } from './model';
