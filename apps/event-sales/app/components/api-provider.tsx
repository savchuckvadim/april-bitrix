import { setConfig } from '@workspace/api';
import { configureBaseURL } from '@workspace/nest-event-sales-api';

// Модуль импортируется из клиентского providers.tsx, поэтому setConfig
// выполняется и на клиенте; ONLINE_API_KEY инлайнится в бандл через next.config `env`.
setConfig({
    apiKey: process.env.ONLINE_API_KEY || '',
});

// Бэкенд event-sales (back/apps/event-sales). NEXT_PUBLIC_* инлайнится
// в бандл на билде, поэтому работает и на клиенте. Без переменной остаётся
// dev-дефолт пакета (http://localhost:3005/) — раньше здесь стоял fallback
// на localhost:3000, а это сам Next, не бэк.
if (process.env.NEXT_PUBLIC_EVENT_SALES_API_URL) {
    configureBaseURL(process.env.NEXT_PUBLIC_EVENT_SALES_API_URL);
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
