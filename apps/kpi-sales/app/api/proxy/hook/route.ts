// app/api/proxy/route.ts
import { API_METHOD } from '@workspace/api'
import { hookAPI } from '@workspace/api/src/services/april-hook-api'
import { NextRequest, NextResponse } from 'next/server'

export interface IHookData {
    url: string
    method: API_METHOD
    model: string
    data: any
}
export async function POST(req: NextRequest) {
    try {
        const data = await req.json() as IHookData
        const apiKey = process.env.ONLINE_API_KEY || '' // <-- используешь напрямую здесь
        console.log(apiKey)
        if (!apiKey) {
            return new Response('Missing API key', { status: 500 })
        }
        const result = await hookAPI.post(
            data.url,
            data.method,
            {
                'content-type': 'application/json',
                'accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-API-KEY': apiKey,
            },
            data.model,
            data.data
        )
        // console.log(result)
        return NextResponse.json(result); 
    } catch (error: any) {
        console.error('❌ Proxy error:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch from remote API',
                details: error?.message || error,
            },
            { status: 500 }
        );
    }
}
