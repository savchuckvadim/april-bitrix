// basePath ('/sales' в проде) Next подставляет сам только в Link/Image/router —
// голому fetch путь нужно префиксовать вручную, иначе запрос уйдёт в корень
// домена, где стоит другое приложение.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export async function logClient(title: string, payload: any) {
    try {
        await fetch(`${BASE_PATH}/api/admin/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                level: 'error',
                payload,
                timestamp: new Date().toISOString(),
            }),
        });
    } catch (e) {
        console.warn('Не удалось отправить лог на сервер', e);
    }
}
