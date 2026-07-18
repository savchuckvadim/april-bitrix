import { setConfig } from '@workspace/api';
import { configureBaseURL } from '@workspace/nest-event-sales-api';

// Модуль импортируется из клиентского providers.tsx, поэтому setConfig
// выполняется и на клиенте; ONLINE_API_KEY инлайнится в бандл через next.config `env`.
setConfig({
    apiKey: process.env.ONLINE_API_KEY || '',
});

// Бэкенд event-sales (back/apps/event-sales); prod URL — TBD.
configureBaseURL(
    process.env.NEXT_PUBLIC_EVENT_SALES_API_URL || 'http://localhost:3000/',
);

export function ApiProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
