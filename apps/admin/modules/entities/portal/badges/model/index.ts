import type {
    BadgeItemDto,
    BadgeItemDtoOutcomesItem,
    BadgeItemDtoPlanTypesItem,
    BadgeItemDtoTarget,
    BadgeItemDtoTone,
    BadgeRegistryOptionDto,
    BadgeSchemaDto,
    PortalBadgesAdminDto,
    PortalBadgesSaveDto,
    PortalBadgesSaveDtoMode,
} from '@workspace/nest-admin-api';
import {
    BadgeItemDtoTarget as BADGE_TARGET,
    BadgeItemDtoTone as BADGE_TONE,
    PortalBadgesSaveDtoMode as BADGE_MODE,
} from '@workspace/nest-admin-api';

/**
 * Доменные типы каталога бейджиков — алиасы над сгенерированными DTO
 * (`@workspace/nest-admin-api`). Имя алиаса = имя класса бэка без `Dto`,
 * поэтому переименование на бэке правит только этот файл.
 *
 * Подписи значений (итогов, типов, цветов) админка НЕ хардкодит — они
 * приходят в `GET /schema` вместе с описаниями.
 */
export type PortalBadges = PortalBadgesAdminDto;
export type PortalBadgesSave = PortalBadgesSaveDto;
export type BadgeItem = BadgeItemDto;
export type BadgeSchema = BadgeSchemaDto;
export type BadgeRegistryOption = BadgeRegistryOptionDto;
export type BadgeMode = PortalBadgesSaveDtoMode;
export type BadgeTarget = BadgeItemDtoTarget;
export type BadgeTone = BadgeItemDtoTone;
export type BadgeOutcome = BadgeItemDtoOutcomesItem;
export type BadgePlanType = BadgeItemDtoPlanTypesItem;

export { BADGE_MODE, BADGE_TARGET, BADGE_TONE };
