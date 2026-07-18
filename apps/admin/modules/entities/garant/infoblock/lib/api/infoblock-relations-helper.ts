import { getAdminGarantInfoblock } from "@workspace/nest-admin-api";
import { InfoblockExcludedSetDto, InfoblockGroupSetDto } from "../../model";

export class InfoblockRelationsHelper {

    private api: ReturnType<typeof getAdminGarantInfoblock>;
    constructor() {
        this.api = getAdminGarantInfoblock();
    }


    async setExcluded(id: string, setInfoblockExcludedDto: InfoblockExcludedSetDto) {
        const response = await this.api.adminGarantInfoblockSetExcluded(id, setInfoblockExcludedDto);
        return response;
    }

    async setGroup(id: string, setInfoblockGroupDto: InfoblockGroupSetDto) {
        const response = await this.api.adminGarantInfoblockSetGroup(id, setInfoblockGroupDto);
        return response;
    }

}
