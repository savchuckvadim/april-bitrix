import { TimezoneGetAllTimezonesParams, CreateTimezoneDto, UpdateTimezoneDto, getAdminTimezonesManagement } from "@workspace/nest-api";

export class TimezoneHelper {
    private api: ReturnType<typeof getAdminTimezonesManagement>;
    constructor() {
        this.api = getAdminTimezonesManagement();
    }

    async getTimezones(dto: TimezoneGetAllTimezonesParams) {
        const response = await this.api.timezoneGetAllTimezones(dto);
        return response;
    }

    async createTimezone(dto: CreateTimezoneDto) {
        const response = await this.api.timezoneCreateTimezone(dto);
        return response;
    }

    async updateTimezone(id: number, dto: UpdateTimezoneDto) {
        const response = await this.api.timezoneUpdateTimezone(id, dto);
        return response;
    }

    async deleteTimezone(id: number) {
        const response = await this.api.timezoneDeleteTimezone(id);
        return response;
    }

    async getTimezoneById(id: number) {
        const response = await this.api.timezoneGetTimezoneById(id);
        return response;
    }

}
