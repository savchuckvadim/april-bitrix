import type {
    AiGuideAdminPageDto,
    AiGuideEndpointDto,
    AiGuideEndpointDtoApp,
    AiGuideKnowledgeKindDto,
    AiGuideLaunchStepDto,
    AiGuideParamDto,
    AiGuidePortalAiSettingDto,
    AiGuideRelatedDto,
    AiGuideSectionDto,
    AiGuideSectionItemDto,
    AiGuideSettingRefDto,
} from '@workspace/nest-admin-api';

/**
 * Доменные алиасы generated-типов путеводителя по AI-аналитике
 * (`Sales AI Analytics Admin`: `GET /api/admin/ai-analytics/guide`,
 * `guide/{code}`). Тексты, коды и связи приходят с бэка из каталога
 * `libs/sales-ai-analytics/src/admin/guide` — фронт ничего не хардкодит.
 */
export type GuideSectionItem = AiGuideSectionItemDto;
export type GuideSection = AiGuideSectionDto;
export type GuideSettingRef = AiGuideSettingRefDto;
export type GuidePortalAiSetting = AiGuidePortalAiSettingDto;
export type GuideParam = AiGuideParamDto;
export type GuideKnowledgeKind = AiGuideKnowledgeKindDto;
export type GuideEndpoint = AiGuideEndpointDto;
export type GuideEndpointApp = AiGuideEndpointDtoApp;
export type GuideAdminPage = AiGuideAdminPageDto;
export type GuideRelated = AiGuideRelatedDto;
export type GuideLaunchStep = AiGuideLaunchStepDto;
