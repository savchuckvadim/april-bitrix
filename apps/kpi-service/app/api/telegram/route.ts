import { TelegramSendMessageDto } from '@/modules/shared';
import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body: TelegramSendMessageDto = await request.json();
    try {
        const response = await backAPI.service(
            EBACK_ENDPOINT.TELEGRAM,
            API_METHOD.POST,
            body,
        );

        return NextResponse.json(response);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 },
        );
    }
}
