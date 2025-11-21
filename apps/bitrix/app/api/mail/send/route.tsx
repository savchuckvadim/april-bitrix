import { getMail } from "@workspace/nest-api";

export async function POST(request: Request) {
    const payload = await request.json();

    const api = getMail()
    const response = await api.mailSendMailOffer({
        email: payload.email,

    });

    return new Response(JSON.stringify(response));
}
