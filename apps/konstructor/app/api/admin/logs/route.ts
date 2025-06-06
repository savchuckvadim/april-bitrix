// apps/kpi-sales/app/api/admin/logs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { logServer } from '@/app/lib/logs/logServer'


export const runtime = 'nodejs'; // <-- Добавить обязательно!





export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        console.log('BODY')

        console.log(body)
        logServer(
            body.level || 'info',
            'KPI REPORT SALES api/bitrix/app',
            `Получен запрос с телом: ${JSON.stringify(body)}`,
            body.domain || 'domain',
            body.useId || 'userId',
        )
        // обработка
        return NextResponse.json({ success: true });
    } catch (error) {
        const err = error as Error;

        logServer(

            'info',
            'KPI REPORT SALES api/bitrix/app',
            `Ошибка обработки POST /api/route: ${err?.message}`,
            'domain',
            'userId',
        )
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}



// export async function GET() {


//     try {
//         const rawLogs = fs.readFileSync(LOG_FILE_PATH, 'utf8');
//         const logLines = rawLogs.trim().split('\n');
//         const logs = logLines.map(line => JSON.parse(line));
//         return NextResponse.json(logs);

//     } catch (error) {
//         console.error('Ошибка чтения логов', error);
//         return new NextResponse('Ошибка сервера', { status: 500 });
//     }
// }

