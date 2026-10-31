import type { NextRequest } from 'next/server';
import { proxyPublicJson } from '@/modules/public-app/lib/server/public-proxy';

/** Действует ли ссылка: 410 — отозвана или истекла. */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
) {
    const { token } = await params;
    return proxyPublicJson(token);
}
