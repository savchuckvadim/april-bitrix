// apps/kpi-sales/app/api/admin/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
// import path from 'path';
import { LOG_FILE_PATH, LogLevel, logServer } from '@/app/lib/log/logServer';

export const runtime = 'nodejs'; // <-- Добавить обязательно!



export async function GET() {


    try {
        const rawLogs = fs.readFileSync(LOG_FILE_PATH, 'utf8');
        const logLines = rawLogs.trim().split('\n');
        const logs = logLines.map(line => JSON.parse(line));
        return NextResponse.json(logs);

    } catch (error) {
        console.error('Ошибка чтения логов', error);
        return new NextResponse('Ошибка сервера', { status: 500 });
    }
}


export type ILogServerBody = {
    level: LogLevel;
    title: string;
    context: string;
    message: string;
    domain: string;
    userId: string;
    payload: unknown;
    timestamp: string;
}
export async function POST(req: NextRequest) {
    const body = await req.json() as ILogServerBody;
    try {

        console.log('BODY')

        console.log(body)
        logServer(
            body.level || 'info',
            body.title || 'title log route',
            body.context || 'context log route',
            body.message || `Получен запрос с телом: ${JSON.stringify(body)}`,
            body.domain || 'domain',
            body.userId || 'userId',  
            body.payload || {},
            body.timestamp || new Date().toISOString(),
        )
        // обработка
        return NextResponse.json({ success: true });
    } catch (error) {
        const err = error as Error;

        logServer(
            'error',
            'KPI REPORT SALES api/admin/logs',
            'KPI REPORT SALES api/admin/logs',
            `Ошибка отправки лога: ${err?.message}`,
            body.domain || 'domain',
            body.userId || 'userId',
            body.payload || {
                error: err?.message,
                errorInfo: err?.stack,
            },
            body.timestamp || new Date().toISOString(),
        )
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
