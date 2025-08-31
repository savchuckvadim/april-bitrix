import { ILogServerBody } from '@/app/api/admin/logs/route';
import { LogLevel } from '@/app/lib/log/logServer';

export interface ILogClientPayload {
    title: string;
    level: LogLevel;
    context: string;
    message: string;
    domain: string;
    userId: number | string | undefined;
}
export async function logClient(info: ILogClientPayload, payload: any) {
    try {
        await fetch('/api/admin/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: info.title,
                level: info.level,
                context: info.context,
                message: info.message,
                domain: info.domain,
                userId: info.userId,
                payload,
                timestamp: new Date().toISOString(),
            } as ILogServerBody),
        });
    } catch (e) {
        console.warn('Не удалось отправить лог на сервер', e);
    }
}
