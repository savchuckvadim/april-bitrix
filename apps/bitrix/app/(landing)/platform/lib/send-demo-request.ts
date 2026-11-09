/** Адрес собственного маршрута сайта, не бэкенда: там проверка и доставка. */
const DEMO_REQUEST_ENDPOINT = '/api/platform-lead';

export interface DemoRequestPayload {
    name: string;
    phone: string;
    company: string;
    comment: string;
    consent: boolean;
    page: string;
    /** Поле-ловушка: у человека всегда пустое. */
    website: string;
}

export type DemoRequestSendResult = 'sent' | 'failed';

/**
 * Отправляет заявку. Успех — только по ответу сервера, а не по клику:
 * иначе человек увидит «заявка у нас», а до нас она не дойдёт.
 */
export async function sendDemoRequest(
    payload: DemoRequestPayload,
): Promise<DemoRequestSendResult> {
    try {
        const response = await fetch(DEMO_REQUEST_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return response.ok ? 'sent' : 'failed';
    } catch {
        return 'failed';
    }
}
