import { Badge } from '@workspace/ui/components/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
    Package,
    CreditCard,
    Gauge,
    LifeBuoy,
    CheckCircle2,
    CircleDashed,
} from 'lucide-react';

/**
 * Кабинет «Менеджер Гарант» — страница, на которую бэкенд
 * (POST /bitrix-marketplace/app → redirect) отправляет пользователя
 * при открытии основного приложения из левого меню Битрикс24.
 *
 * ЗАГЛУШКА: разделы (продукты, подписки/оплаты, тарифы, статусы установки)
 * пока статические; наполнение данными с бэка — следующий этап.
 * Параметры domain/member_id/status/lang приходят в query от бэкенда.
 */
export default async function MarketplaceCabinetPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;
    const domain = typeof params.domain === 'string' ? params.domain : null;
    const status = typeof params.status === 'string' ? params.status : null;

    const products = [
        {
            code: 'sales',
            title: 'Продукт Sales',
            description:
                'Звонки, конструктор КП, отчёты. Плейсменты и сущности CRM.',
            active: false,
        },
        {
            code: 'service',
            title: 'Продукт Service',
            description:
                'Сервисное направление. Доступен только вместе с Sales.',
            active: false,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-6 py-8">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Менеджер Гарант
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Кабинет приложения: продукты, подписки, оплаты и
                            статус установки
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {domain && (
                            <Badge variant="outline">
                                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                                {domain}
                            </Badge>
                        )}
                        {status && (
                            <Badge
                                variant="outline"
                                className={
                                    status === 'success'
                                        ? 'border-green-200 text-green-700'
                                        : 'border-red-200 text-red-700'
                                }
                            >
                                {status === 'success'
                                    ? 'Подключение активно'
                                    : 'Ошибка подключения'}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Мои продукты
                            </CardTitle>
                            <CardDescription>
                                Доступ к продуктам предоставляется по договору
                                с вендором
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {products.map((product) => (
                                <div
                                    key={product.code}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            {product.title}
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className={
                                                product.active
                                                    ? 'border-green-200 text-green-700'
                                                    : 'border-gray-200 text-gray-500'
                                            }
                                        >
                                            {product.active
                                                ? 'Подключён'
                                                : 'Не подключён'}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {product.description}
                                    </p>
                                </div>
                            ))}
                            <Button className="w-full" disabled>
                                Оставить заявку на подключение (скоро)
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Подписка и оплаты
                                </CardTitle>
                                <CardDescription>
                                    Расчёты — по прямому договору с вендором
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    Раздел в разработке. Здесь появятся статус
                                    договора, срок действия и история оплат.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gauge className="h-5 w-5" />
                                    Статус установки
                                </CardTitle>
                                <CardDescription>
                                    Компоненты, установленные на вашем портале
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>Приложение установлено</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <CircleDashed className="h-4 w-4" />
                                    <span>
                                        Детальные статусы компонентов — в
                                        разработке
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LifeBuoy className="h-5 w-5" />
                                    Поддержка
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">
                                    По вопросам подключения и работы приложения
                                    свяжитесь с нами — контакты появятся здесь.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
