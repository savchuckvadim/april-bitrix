// packages/ws-client/src/index.ts
import { io, Socket } from 'socket.io-client';
export type { Socket }
// const NEXT_PUBLIC_WS_HOST = 'ws://localhost:8334'

const NEXT_PUBLIC_WS_HOST ='https://back.april-app.ru/'


export class WSClient {
    public readonly socket: Socket;

    constructor(userId: number, domain: string) {
        this.socket = io(NEXT_PUBLIC_WS_HOST, {
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
        const id = this.id
        console.log('✅ Socket connected:', id);
        this.socket.on(event, callback);
    }

    emit(event: string, data: any) {
        console.log('✅ Socket emit connected event:', event);
        const id = this.id
        console.log('✅ Socket emit connected:', id);
        this.socket.emit(event, data);
    }

    disconnect() {

        console.log('✅ Socket disconnect');
        const id = this.id
        console.log('✅ Socket disconnect connected:', id);

        this.socket.disconnect();
    }

    off(event: string, hendler: (args: any) => void) {
        this.socket.off(event, hendler)
    }
    get id(): string | undefined {
        return this.socket.id;
    }
}
