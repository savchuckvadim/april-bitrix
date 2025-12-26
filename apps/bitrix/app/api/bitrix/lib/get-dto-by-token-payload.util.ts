
import {  BitrixTokenDto, CreateBitrixAppDto, CreateBitrixAppDtoCode, CreateBitrixAppDtoGroup, CreateBitrixAppDtoStatus, CreateBitrixAppDtoType, CreateBitrixAppWithTokenDto, CreateBitrixTokenDto } from "@workspace/nest-api";
import { BitrixTokenPayload } from "./get-token-payload-by-params.util";



export const getSetupDto = (
    payload: BitrixTokenPayload,

): CreateBitrixAppWithTokenDto => {
    return {
        code: CreateBitrixAppDtoCode.sales_full,
        domain: payload.domain,
        group: CreateBitrixAppDtoGroup.sales,
        status: CreateBitrixAppDtoStatus.active,
        type: CreateBitrixAppDtoType.full,
        token: {
            access_token: payload.access_token,

            expires_at: getExpiresAt(payload.expires_in),
            refresh_token: payload.refresh_token,
            application_token: payload.application_token,
            member_id: payload.member_id,
        } as BitrixTokenDto,

    } as CreateBitrixAppWithTokenDto;
};


const getExpiresAt = (expires_in: number | undefined) => {
    const expiresAt = new Date(
        Date.now() + (expires_in ?? 3600) * 1000,
    )
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '')
        .split('.')[0]; // убираем миллисекунды
    return expiresAt;
};
