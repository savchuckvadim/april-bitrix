import { NextRequest, NextResponse } from "next/server";

export const redirectToInstall = (req: NextRequest, installStatus: 'success' | 'fail') => {
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
    const redirectUrl = `${proto}://${host}/install?install=${installStatus}`;
    return NextResponse.redirect(redirectUrl);
}
