import { setConfig } from '@workspace/api';
import { configureBaseURL } from '@workspace/nest-event-sales-api';

// Это серверный компонент, поэтому имеет доступ к process.env
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
