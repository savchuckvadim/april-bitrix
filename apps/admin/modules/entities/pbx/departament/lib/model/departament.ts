import type {
    CreatePortalDepartamentDto,
    DeleteDepartamentResponseDto,
    InstallDepartamentResponseDto,
    PortalDepartamentResponseDto,
    UpdatePortalDepartamentDto,
} from '@workspace/nest-pbx-install-api';

/**
 * PortalDB `departaments` row of the full-CRUD controller
 * `PBX Portal Departament (DB)` (`pbx/portal-departament`).
 */
export type PortalDepartament = PortalDepartamentResponseDto;

export type CreatePortalDepartamentInput = CreatePortalDepartamentDto;

/** Partial patch; `multipleTag: null` clears the tag. */
export type UpdatePortalDepartamentInput = UpdatePortalDepartamentDto;

export type InstallDepartamentResult = InstallDepartamentResponseDto;
export type DeleteDepartamentResult = DeleteDepartamentResponseDto;

/** Known `multipleTag` values; any custom string is also allowed. */
export const DEPARTAMENT_MULTIPLE_TAGS = ['ОП', 'ОС'] as const;
