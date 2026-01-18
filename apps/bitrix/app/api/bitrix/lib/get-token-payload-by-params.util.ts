import { NextRequest } from "next/server";

export interface BitrixTokenPayload {
    access_token?: string | null;
    refresh_token?: string | null;
    expires_in?: number;
    domain: string | null;
    application_token?: string | null;
    member_id?: string | null;

}

interface RequestData {
    body: { [key: string]: string };

    query: string;
}



export const getTokenPayLoad = (req: NextRequest, params: URLSearchParams): BitrixTokenPayload => {

    const requestData: RequestData = {
        body: {},

        query: '',
    };
    const domain = req.nextUrl.searchParams.get('DOMAIN');
    params.forEach((value, key) => {
        requestData.body[key] = value;
    });
    requestData.query = req.nextUrl.searchParams.toString();


    const event = params.get('event');
    const placement = params.get('PLACEMENT');

    let tokenPayload: Partial<BitrixTokenPayload> = {};

    let install = false;
    // let restOnly = true;
    const memberId = requestData.body['member_id'];

    if (event === 'ONAPPINSTALL') {
        // пришёл через webhook
        const auth = JSON.parse(params.get('auth') || '{}');
        // restOnly = false;
        install = !!auth.access_token;

        tokenPayload = {
            access_token: auth.access_token,
            refresh_token: auth.refresh_token,
            expires_in: auth.expires_in,
            domain: domain,
            application_token: auth.application_token,
            member_id: memberId,
        };
    } else if (placement === 'DEFAULT') {
        // пришёл как iframe (PLACEMENT)
        // restOnly = false;
        install = !!params.get('AUTH_ID');
        tokenPayload = {
            access_token: params.get('AUTH_ID'),
            refresh_token: params.get('REFRESH_ID'),
            expires_in: Number(params.get('AUTH_EXPIRES')),
            domain: domain,
            application_token: params.get('APP_SID'), // как fallback
            member_id: memberId,
        };
    }

    console.log('INSTALL: event', event);
    console.log('INSTALL: placement', placement);
    console.log('INSTALL: tokenPayload', tokenPayload);

    return tokenPayload as BitrixTokenPayload;
}
