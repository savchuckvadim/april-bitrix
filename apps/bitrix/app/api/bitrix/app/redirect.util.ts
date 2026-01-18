import { NextRequest, NextResponse } from "next/server";

export const redirectToApp = (req: NextRequest) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    console.log('baseUrl', baseUrl);
    const redirectUrl = `${baseUrl}/bitrix`;
    return NextResponse.redirect(redirectUrl, 302);
}
