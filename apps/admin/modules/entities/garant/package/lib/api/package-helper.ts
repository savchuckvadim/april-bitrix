import { getAdminGarantPackage } from "@workspace/nest-admin-api";
import { IGarantPackageCreate, IGarantPackageUpdate } from '../../model';

export class PackageHelper {
    private api: ReturnType<typeof getAdminGarantPackage>;
    constructor() {
        this.api = getAdminGarantPackage();
    }

    async list() {
        const response = await this.api.adminGarantPackageFindAll();
        return response;
    }

    async create(dto: IGarantPackageCreate) {
        const response = await this.api.adminGarantPackageCreate(dto);
        return response;
    }

    async update(id: string, dto: Partial<IGarantPackageUpdate>) {
        const response = await this.api.adminGarantPackageUpdate(id, dto);
        return response;
    }

    async get(id: string) {
        const response = await this.api.adminGarantPackageFindOne(id);
        return response;
    }



}
