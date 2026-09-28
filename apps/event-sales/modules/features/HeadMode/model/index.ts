import type {
    ActingManagerDto,
    BxCurrentUserDto,
    BxDepartmentStructureRequestDto,
    BxDepartmentStructureRequestDtoDomain,
    BxDepartmentStructureResponseDto,
} from '@workspace/nest-event-sales-api';

// Ре-маппинг generated DTO → доменные алиасы (правило CLAUDE.md).
export type HeadStructureRequest = BxDepartmentStructureRequestDto;
export type HeadStructureDomain = BxDepartmentStructureRequestDtoDomain;
export type HeadStructureResponse = BxDepartmentStructureResponseDto;
export type HeadCurrentUser = BxCurrentUserDto;
export type ActingManager = ActingManagerDto;
