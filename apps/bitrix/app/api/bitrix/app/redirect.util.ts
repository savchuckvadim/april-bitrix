import { NextRequest, NextResponse } from "next/server";

export const redirectToApp = (req: NextRequest) => {
    const headers = req.headers;
    const proto =
        headers.get('x-forwarded-proto') ??
        (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const host =
        headers.get('x-forwarded-host') ??
        headers.get('host');
    if (!host) {
        throw new Error('Cannot determine host for redirect');
    }
    const redirectUrl = `${proto}://${host}/bitrix`;
    return NextResponse.redirect(redirectUrl, 302);
}
