import { InfogroupCreateDto, InfogroupResponseDto } from "../../model";
import { getAdminGarantInfoGroup } from "@workspace/nest-admin-api";

export class InfoGroupsHelper {
    private api: ReturnType<typeof getAdminGarantInfoGroup>;
    constructor() {
        this.api = getAdminGarantInfoGroup();
    }

    async list(): Promise<InfogroupResponseDto[]> {
        const response = await this.api.adminGarantInfogroupFindAll();
        return response;
    }

    async create(dto: InfogroupCreateDto): Promise<InfogroupResponseDto> {
        const response = await this.api.adminGarantInfogroupCreate(dto);
        return response;
    }

    async update(id: string, dto: InfogroupCreateDto): Promise<InfogroupResponseDto> {
        const response = await this.api.adminGarantInfogroupUpdate(id, dto);
        return response;
    }

    async get(id: string): Promise<InfogroupResponseDto> {
        const response = await this.api.adminGarantInfogroupFindOne(id);
        return response;
    }
}
