import { Badge } from '@workspace/ui/components/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { LayoutPanelTop } from 'lucide-react';

/**
 * Страница виджета (плейсмента) «Менеджер Гарант».
 *
 * Сюда редиректит бэкенд-роутер при открытии виджета из Битрикса:
 * POST https://api.pbx.april-app.ru/api/bitrix-marketplace/placement/<code>
 *   → 302 → /portal/placement/<code>?domain=&member_id=&lang=&status=&placement_options=
 *
 * Коды виджетов — эталон-манифест бэка (back: apps/pbx/src/marketplace/
 * config/marketplace-manifest.ts): event-sales | konstructor | report-sales.
 *
 * ЗАГЛУШКА: показывает контекст открытия; реальные виджеты (звонки,
 * конструктор, отчёты) подключаются сюда следующим этапом.
 */
export default async function MarketplacePlacementPage({
    params,
    searchParams,
}: {
    params: Promise<{ code: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { code } = await params;
    const query = await searchParams;
    const domain = typeof query.domain === 'string' ? query.domain : null;
    const placementOptions =
        typeof query.placement_options === 'string'
            ? query.placement_options
            : null;

    const titles: Record<string, string> = {
        'event-sales': 'Гарант: Звонки',
        konstructor: 'Гарант: Конструктор КП',
        'report-sales': 'Гарант: Отчёт ОП KPI',
    };
    const title = titles[code] ?? `Виджет «${code}»`;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutPanelTop className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <CardDescription>
                        Виджет приложения «Менеджер Гарант»
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {domain && (
                        <Badge variant="outline">
                            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                            {domain}
                        </Badge>
                    )}
                    <p className="text-sm text-gray-500">
                        Раздел в разработке — функциональность виджета
                        подключается. Код виджета: <code>{code}</code>
                    </p>
                    {placementOptions && (
                        <pre className="overflow-x-auto rounded-lg border bg-white p-3 text-xs text-gray-600">
                            {placementOptions}
                        </pre>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
