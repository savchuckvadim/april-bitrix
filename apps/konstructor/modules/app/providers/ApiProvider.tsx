import { setConfig } from '@workspace/api';
import { configureBaseURL } from '@workspace/nest-konstructor-api';

// Это серверный компонент, поэтому имеет доступ к process.env
setConfig({
    apiKey: process.env.ONLINE_API_KEY || '',
});

// NEXT_PUBLIC_* инлайнится в бандл на билде — работает и на клиенте.
// Без переменной остаётся дев-дефолт пакета (http://localhost:3007/).
if (process.env.NEXT_PUBLIC_KONSTRUCTOR_API_URL) {
    configureBaseURL(process.env.NEXT_PUBLIC_KONSTRUCTOR_API_URL);
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
