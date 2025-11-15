
import {  CreateBitrixAppDto, CreateBitrixAppDtoCode, CreateBitrixAppDtoGroup, CreateBitrixAppDtoStatus, CreateBitrixAppDtoType } from "@workspace/nest-api";

export interface BitrixTokenPayload {
    access_token?: string | null;
    refresh_token?: string | null;
    expires_in?: number;
    domain: string | null;
    application_token?: string | null;
    member_id?: string | null;

}
export const getSetupDto = (
    payload: BitrixTokenPayload,

): CreateBitrixAppDto => {
    return {
        code: CreateBitrixAppDtoCode.sales_full,
        domain: payload.domain,
        group: CreateBitrixAppDtoGroup.sales,
        status: CreateBitrixAppDtoStatus.active,
        type: CreateBitrixAppDtoType.full,
        token: {
            access_token: payload.access_token,
            // client_id: '',
            // client_secret: '',
            expires_at: getExpiresAt(payload.expires_in),
            refresh_token: payload.refresh_token,
            application_token: payload.application_token,
            member_id: payload.member_id,
        },
        secret: {
            client_id: '',
            client_secret: '',
        },
    } as CreateBitrixAppDto;
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
