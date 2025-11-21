import { getTelegram, TelegramSendMessageDtoApp } from "@workspace/nest-api";

export async function POST(request: Request) {
    const payload = await request.json();

    const api = getTelegram()
    const response = await api.telegramGetTelegram({
        app: TelegramSendMessageDtoApp.kpi_sales,
        text: JSON.stringify(payload),
        domain: 'test',
        userId: 'test',
    });

    return new Response(JSON.stringify(response));
}
