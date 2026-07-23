// packages/ws-client/src/index.ts
import { io, Socket } from 'socket.io-client';
export type { Socket };
// const NEXT_PUBLIC_WS_HOST = 'ws://localhost:8334'

/** Дефолт для существующих консюмеров; новые приложения передают host явно. */
const DEFAULT_WS_HOST = 'https://back.april-app.ru/';
// 'https://back.april-dev.ru/' | 'http://localhost:3000/'
export class WSClient {
    public readonly socket: Socket;

    constructor(userId: number, domain: string, host: string = DEFAULT_WS_HOST) {
        this.socket = io(host, {
            transports: ['websocket'],
            autoConnect: true,
            // auth: {
            //     userId,            // получено с клиента
            //     domain // тоже
            // }
        });
    }

    on(event: string, callback: (...args: any[]) => void) {
        console.log('✅ Socket connected event:', event);
        const id = this.id;
        console.log('✅ Socket connected:', id);
        this.socket.on(event, callback);
    }

    emit(event: string, data: any) {
        console.log('✅ Socket emit connected event:', event);
        const id = this.id;
        console.log('✅ Socket emit connected:', id);
        this.socket.emit(event, data);
    }

    disconnect() {
        console.log('✅ Socket disconnect');
        const id = this.id;
        console.log('✅ Socket disconnect connected:', id);

        this.socket.disconnect();
    }

    off(event: string, hendler: (args: any) => void) {
        this.socket.off(event, hendler);
    }
    get id(): string | undefined {
        return this.socket.id;
    }
}
