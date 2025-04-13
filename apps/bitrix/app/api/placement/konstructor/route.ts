
import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   const redirectUrl = new URL('/placement/konstructor', req.url)
//   redirectUrl.searchParams.set('inBitrix', 'y') // только если хочешь

//   return NextResponse.redirect(redirectUrl)
// }

// interface BitrixTokenPayload {
//   access_token: string | null;
//   refresh_token: string | null;
//   expires_in: number;
//   domain: string | null;
//   application_token?: string | null;
//   member_id?: string | null;
// }

// interface RequestData {

//   body: { [key: string]: string }

//   query: string
// }
//api/placement/konstructor

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    console.log('rawBody')
    console.log(rawBody)
    // const params = new URLSearchParams(rawBody);

    // const requestData: RequestData = {

    //   body: {},

    //   query: '',
    // };

    // params.forEach((value, key) => {
    //   requestData.body[key] = value;
    // });
    // requestData.query = req.nextUrl.searchParams.toString();

    // console.log('requestData')
    // console.log(requestData)


    const redirectUrl = new URL('/placement/konstructor', req.url);
    redirectUrl.searchParams.set('inBitrix', 'y');
    redirectUrl.searchParams.set('placement', 'placement');
    
    return NextResponse.redirect(redirectUrl, 302);

  } catch (error) {
    console.error('[Bitrix Install] error:', error);

    const errorRedirect = new URL('/placement/konstructor', req.url);
    errorRedirect.searchParams.set('install', 'fail');

    return NextResponse.redirect(errorRedirect, 302);
  }
}

    // const event = params.get('event');
    // const placement = params.get('PLACEMENT');

    // let tokenPayload: Partial<BitrixTokenPayload> = {};

    // // let install = false;
    // // let restOnly = true;
    // const memberId = requestData.body['member_id'];
    // const domain = req.nextUrl.searchParams.get('DOMAIN');