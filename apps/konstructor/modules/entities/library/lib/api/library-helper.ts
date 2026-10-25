import { getKonstructorDealLibrary } from '@workspace/nest-konstructor-api';
import type { SnapshotRecordDto } from '../../../snapshot/model/dto';
import type {
    LibraryCreateDto,
    LibraryItem,
    LibraryKind,
    LibraryPatchDto,
    LibraryRights,
} from '../../model/dto';

/**
 * Избранное и акции (bx_document_deals, kind favorite|promotion) через
 * @workspace/nest-konstructor-api — ЕДИНСТВЕННОЕ место импорта api-пакета
 * для слайса library.
 */
export class LibraryHelper {
    private api = getKonstructorDealLibrary();

    async list(domain: string, userId: number, kind?: LibraryKind): Promise<LibraryItem[]> {
        return this.api.innerDealLibraryList({ domain, userId, kind });
    }

    async rights(domain: string, userId: number): Promise<LibraryRights> {
        return this.api.innerDealLibraryRights({ domain, userId });
    }

    /** Полный слепок заготовки — та же плоская запись, что у сделки. */
    async get(domain: string, userId: number, id: number): Promise<SnapshotRecordDto> {
        return this.api.innerDealLibraryGet(id, { domain, userId });
    }

    async create(dto: LibraryCreateDto): Promise<SnapshotRecordDto> {
        return this.api.innerDealLibraryCreate(dto);
    }

    async patch(id: number, dto: LibraryPatchDto): Promise<SnapshotRecordDto> {
        return this.api.innerDealLibraryPatch(id, dto);
    }

    async remove(domain: string, userId: number, id: number): Promise<boolean> {
        const result = await this.api.innerDealLibraryRemove(id, { domain, userId });
        return result.deleted;
    }
}
