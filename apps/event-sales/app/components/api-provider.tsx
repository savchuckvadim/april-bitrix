import { setConfig } from '@workspace/api';
import {
    configureBaseURL,
    configureRequestTimeout,
} from '@workspace/nest-event-sales-api';
import { resolveRequestTimeout } from '@/modules/shared/lib/request-timeout';

// Модуль импортируется из клиентского providers.tsx, поэтому setConfig
// выполняется и на клиенте; ONLINE_API_KEY инлайнится в бандл через next.config `env`.
//
// appId попадает в ключи браузерного кэша (`swr-cache`): в проде мы делим
// origin с event-service (`/sales` и `/service`), и без этого сегмента оба
// приложения писали бы слепок портала в одну ячейку.
setConfig({
    apiKey: process.env.ONLINE_API_KEY || '',
    appId: 'event-sales',
});

// Бэкенд event-sales (back/apps/event-sales). NEXT_PUBLIC_* инлайнится
// в бандл на билде, поэтому работает и на клиенте. Без переменной остаётся
// dev-дефолт пакета (http://localhost:3005/) — раньше здесь стоял fallback
// на localhost:3000, а это сам Next, не бэк.
if (process.env.NEXT_PUBLIC_EVENT_SALES_API_URL) {
    configureBaseURL(process.env.NEXT_PUBLIC_EVENT_SALES_API_URL);
}

// Потолок ожидания для интерактивных чтений (связи, пересечения, отдел…):
// без него перегруженный сервер держал запрос минутами, а фрейм показывал
// вечный скелетон. Какие ручки считаются интерактивными — в request-timeout.
configureRequestTimeout(resolveRequestTimeout);

export function ApiProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
