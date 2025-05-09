// app/api/proxy/route.ts
import { httpRequestCounter } from '@/app/lib/metrics/metrics';
import { httpRequestDuration } from '@/app/lib/metrics/metrics';
import { withMetrics } from '@/app/lib/metrics/withMetrics';
import { ReportRequest } from '@/modules/entities/report/model/report-service'
import { API_METHOD, onlineGeneralAPI } from '@workspace/api'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest,) {
    return withMetrics(req, async () => {

        try {
            const body = await req.json() as ReportRequest
            const apiKey = process.env.ONLINE_API_KEY || '' // <-- используешь напрямую здесь
            console.log(apiKey)
            if (!apiKey) {
                return new Response('Missing API key', { status: 500 })
            }
            const result = await onlineGeneralAPI.post('/report/settings/get/filter', API_METHOD.POST,
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

    })
}
