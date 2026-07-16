import type { PbxGroup } from '../../../lib/model/common';

/**
 * PortalDB `departaments` row as returned by the new full-CRUD controller
 * `PBX Portal Departament (DB)` (`pbx/portal-departament`). Typed locally until
 * the orval client is regenerated against the updated backend.
 */
export interface PortalDepartament {
    id: number;
    portalId: number;
    type: string;
    group: PbxGroup;
    name: string;
    title: string;
    bitrixId: number;
    /** Собирать ли ЦУП из разрозненных по всей структуре отделов. */
    isMultiple: boolean;
    /** По какому тэгу искать эти отделы: ОП / ОС или custom. null — не задан. */
    multipleTag: string | null;
}

export interface CreatePortalDepartamentInput {
    portalId: number;
    group: PbxGroup;
    name: string;
    title: string;
    bitrixId: number;
    isMultiple?: boolean;
    multipleTag?: string | null;
}

/** Partial patch; `multipleTag: null` clears the tag. */
export interface UpdatePortalDepartamentInput {
    name?: string;
    title?: string;
    bitrixId?: number;
    isMultiple?: boolean;
    multipleTag?: string | null;
}

/** Known `multipleTag` values; any custom string is also allowed. */
export const DEPARTAMENT_MULTIPLE_TAGS = ['ОП', 'ОС'] as const;