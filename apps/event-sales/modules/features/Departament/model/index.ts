import type {
    BxDepartmentRequestDto,
    BxDepartmentRequestDtoDomain,
    BxDepartmentResponseDto,
} from '@workspace/nest-event-sales-api';

// Ре-маппинг generated DTO → доменные алиасы (правило CLAUDE.md).
export type DepartmentRequestDto = BxDepartmentRequestDto;
export type DepartmentDomain = BxDepartmentRequestDtoDomain;
export type DepartmentResponse = BxDepartmentResponseDto;
