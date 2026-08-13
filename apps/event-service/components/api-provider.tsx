import { setConfig } from '@workspace/api';
import { configureBaseURL } from '@workspace/nest-event-service-api';

// Это серверный компонент, поэтому имеет доступ к process.env
setConfig({
    apiKey: process.env.ONLINE_API_KEY || '',
});

// Бэкенд event-service (back/apps/event-service). NEXT_PUBLIC_* инлайнится
// в бандл на билде, поэтому работает и на клиенте. Без переменной остаётся
// dev-дефолт пакета (http://localhost:3006/).
if (process.env.NEXT_PUBLIC_EVENT_SERVICE_API_URL) {
    configureBaseURL(process.env.NEXT_PUBLIC_EVENT_SERVICE_API_URL);
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
