import { NextRequest, NextResponse } from 'next/server';

interface BitrixTokenPayload {
  access_token: string | null;
  refresh_token: string | null;
  expires_in: number;
  domain: string | null;
  application_token?: string | null;
  member_id?: string | null;
}

interface RequestData {

  body: { [key: string]: string }

  query: string
}
//install

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    const requestData: RequestData = {

      body: {},

      query: '',
    };

    params.forEach((value, key) => {
      requestData.body[key] = value;
    });
    requestData.query = req.nextUrl.searchParams.toString();

    console.log('requestData')
    console.log(requestData)
    const event = params.get('event');
    const placement = params.get('PLACEMENT');

    let tokenPayload: Partial<BitrixTokenPayload> = {};

    // let install = false;
    // let restOnly = true;
    const memberId = requestData.body['member_id'];
    const domain = req.nextUrl.searchParams.get('DOMAIN');

    if (event === 'ONAPPINSTALL') {
      // пришёл через webhook
      const auth = JSON.parse(params.get('auth') || '{}');
      // restOnly = false;
      // install = !!auth.access_token;

      tokenPayload = {
        access_token: auth.access_token,
        refresh_token: auth.refresh_token,
        expires_in: auth.expires_in,
        domain: domain,
        application_token: auth.application_token,
        member_id: memberId

      };
    } else if (placement === 'DEFAULT') {
      // пришёл как iframe (PLACEMENT)
      // restOnly = false;
      // install = !!params.get('AUTH_ID');
      tokenPayload = {
        access_token: params.get('AUTH_ID'),
        refresh_token: params.get('REFRESH_ID'),
        expires_in: Number(params.get('AUTH_EXPIRES')),
        domain: domain,
        application_token: params.get('APP_SID'), // как fallback
        member_id: memberId

      };
    }

    // console.log('INSTALL: event', event);
    // console.log('INSTALL: placement', placement);
    // console.log('INSTALL: tokenPayload', tokenPayload);

    // let installStatus: 'success' | 'fail' = 'fail';


    if (tokenPayload.access_token && tokenPayload.refresh_token && tokenPayload.domain) {
      // installStatus = install ? 'success' : 'fail';


      // ✅ Сохраняем в Laravel или напрямую
      // await fetch(`${process.env.LARAVEL_API}/api/bitrix/portal/store`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     domain,
      //     member_id: memberId,
      //     access_token: accessToken,
      //     refresh_token: refreshToken,
      //     expires_at: Date.now() + expiresIn * 1000,
      //     application_token: applicationToken,
      //   }),
      // });

      // ✅ Регистрируем плэйсмент
      // await fetch(`https://${tokenPayload.domain}/rest/placement.bind`, {
      //   method: 'POST',
      //   body: new URLSearchParams({
      //     PLACEMENT: 'DEFAULT',
      //     HANDLER: 'https://front.april-app.ru/event/app/placement.php',
      //     TITLE: 'Звонки тест Callings',
      //     auth: tokenPayload.access_token,
      //   }),
      // });
    }
    const redirectUrl = new URL('/placement/konstructor', req.url);
    redirectUrl.searchParams.set('inBitrix', 'y');

    return NextResponse.redirect(redirectUrl, 302);

  } catch (error) {
    console.error('[Bitrix Install] error:', error);

    const errorRedirect = new URL('/install', req.url);
    errorRedirect.searchParams.set('install', 'fail');

    return NextResponse.redirect(errorRedirect, 302);
  }
}

