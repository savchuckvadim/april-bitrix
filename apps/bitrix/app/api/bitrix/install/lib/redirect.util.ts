import { NextRequest, NextResponse } from "next/server";

export const redirectToInstall = (req: NextRequest, installStatus: 'success' | 'fail') => {
    // const headers = req.headers;
    // const proto =
    //     headers.get('x-forwarded-proto') ??
    //     (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    // const host =
    //     headers.get('x-forwarded-host') ??
    //     headers.get('host');
    // if (!host) {
    //     throw new Error('Cannot determine host for redirect');
    // }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    console.log('baseUrl', baseUrl);
    const redirectUrl = `${baseUrl}/install?install=${installStatus}`;
    return NextResponse.redirect(redirectUrl, 302);
}
