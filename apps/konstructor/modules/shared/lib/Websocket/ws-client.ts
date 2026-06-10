import { WSClient as WSClientWorkspace } from '@workspace/ws';

export let wsClient: WSClientWorkspace;

export class WSClient {
    // private wsClient: WSClientWorkspace | null = null;
    constructor(
        private readonly userId: number,
        private readonly domain: string,
    ) {}

    init() {
        wsClient = new WSClientWorkspace(this.userId, this.domain);
    }

    static getClient() {
        if (!wsClient) {
            throw new Error('WSClient not initialized');
        }
        return wsClient;
    }
}
