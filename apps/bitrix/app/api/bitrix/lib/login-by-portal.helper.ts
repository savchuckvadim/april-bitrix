import { CreateBitrixAppWithTokenDto, getBitrixSetupAppUi, InstallAppFromPortalResponseDto } from "@workspace/nest-api"

export const loginByPortal = async (dto: CreateBitrixAppWithTokenDto): Promise<InstallAppFromPortalResponseDto>       => {

    const api = getBitrixSetupAppUi();
    const response = await api.bitrixAppUiSalesManagerApp(dto);
    return response;
}
