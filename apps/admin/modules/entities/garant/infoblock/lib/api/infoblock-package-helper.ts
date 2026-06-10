import { getAdminGarantInfoblockPackage, } from "@workspace/nest-api";
import { InfoblockPackagesAddDto, InfoblockPackagesInPackagesSetDto, InfoblockPackagesRemoveFromPackagesDto, InfoblockPackagesSetDto } from "../../model";
import { InfoblockPackagesAddToPackagesDto } from "../../model";
import { InfoblockPackagesRemoveDto } from "../../model";

export class InfoblockPackageHelper {
    private api: ReturnType<typeof getAdminGarantInfoblockPackage>;
    constructor() {
        this.api = getAdminGarantInfoblockPackage();
    }

    async addPackages(id: string, addInfoblockPackagesDto: InfoblockPackagesAddDto) {
        const response = await this.api.adminGarantInfoblockPackageAddPackages(id, addInfoblockPackagesDto);

        return response;
    }

    async addInfoblockToPackages(id: string, addInfoblockPackagesDto: InfoblockPackagesAddToPackagesDto) {
        const response = await this.api.adminGarantInfoblockPackageAddToPackages(id, addInfoblockPackagesDto);

        return response;
    }

    async removePackages(id: string, removeInfoblockPackagesDto: InfoblockPackagesRemoveDto) {
        const response = await this.api.adminGarantInfoblockPackageRemovePackages(id, removeInfoblockPackagesDto);
        return response;
    }

    async removeFromPackages(id: string, removeInfoblockPackagesDto: InfoblockPackagesRemoveFromPackagesDto) {
        const response = await this.api.adminGarantInfoblockPackageRemoveFromPackages(id, removeInfoblockPackagesDto);
        return response;
    }




    async setInPackages(id: string, setInfoblockPackagesDto: InfoblockPackagesInPackagesSetDto) {
        const response = await this.api.adminGarantInfoblockPackageSetInPackages(id, setInfoblockPackagesDto);
        return response;
    }


}
