// app/api/proxy/route.ts
import { API_METHOD, onlineGeneralAPI } from '@workspace/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const apiKey = process.env.ONLINE_API_KEY || '' // <-- используешь напрямую здесь
        console.log(apiKey)
        if (!apiKey) {
            return new Response('Missing API key', { status: 500 })
        }
        const result = await onlineGeneralAPI.post('/report/settings/filter', API_METHOD.POST,
            body,
            {
                'content-type': 'application/json',
                'accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-API-KEY': apiKey,
            }
        )

        return NextResponse.json(result); // 💥 ВОТ ЭТО ГЛАВНОЕ
    } catch (error: unknown) {
        console.error('❌ Proxy error:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch from remote API',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
