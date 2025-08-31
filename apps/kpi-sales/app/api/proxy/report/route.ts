// apps/kpi-sales/app/api/proxy/route.ts (Next.js 13/14 App Router)

import { NextRequest, NextResponse } from 'next/server';
import { hook as hookAPI } from '@workspace/api'; // используй уже готовые сервисы

// app/api/proxy/route.ts
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { url, method, model, data } = body;

    const result = await hookAPI.service(url, method, model, data);

    return NextResponse.json({ data: result });
}
