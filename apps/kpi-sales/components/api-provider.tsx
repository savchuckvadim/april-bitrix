import { setConfig } from '@workspace/api';
import { configureBaseURL } from '@workspace/nest-kpi-report-sales-api';

setConfig({
    apiKey: process.env.ONLINE_API_KEY || '',
});

// NEXT_PUBLIC_* инлайнится в бандл на билде, поэтому работает и на клиенте.
// Без переменной остаётся dev-дефолт пакета (http://localhost:3000/).
if (process.env.NEXT_PUBLIC_KPI_SALES_API_URL) {
    configureBaseURL(process.env.NEXT_PUBLIC_KPI_SALES_API_URL);
}

export function ApiProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
