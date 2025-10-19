import { setConfig } from '@workspace/api';

// Это серверный компонент, поэтому имеет доступ к process.env
setConfig({
    apiKey: process.env.ONLINE_API_KEY || '',
});

export function ApiProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
