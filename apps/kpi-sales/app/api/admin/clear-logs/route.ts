// apps/kpi-sales/app/api/admin/clear-logs/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import { LOG_FILE_PATH } from '@/app/lib/log/logServer';

export const runtime = 'nodejs';



export async function POST() {
  try {
    fs.writeFileSync(LOG_FILE_PATH, '');
    return NextResponse.json({ message: 'Логи очищены' });
  } catch (error) {
    console.error('Ошибка очистки логов', error);
    return new NextResponse('Ошибка сервера', { status: 500 });
  }
}
