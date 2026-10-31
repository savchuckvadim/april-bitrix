import type { NextRequest } from 'next/server';
import { proxyPublicJson } from '@/modules/public-app/lib/server/public-proxy';

/** Каталог конструктора по ссылке. */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
) {
    const { token } = await params;
    return proxyPublicJson(token, '/catalog');
}
