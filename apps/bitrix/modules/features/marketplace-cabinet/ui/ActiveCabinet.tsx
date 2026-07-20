'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Package,
    CreditCard,
    Gauge,
    LifeBuoy,
    CheckCircle2,
    CircleDashed,
    Loader2,
    XCircle,
    MinusCircle,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    getCabinetSummary,
    installProduct,
    SessionExpiredError,
    type CabinetComponent,
    type CabinetSummary,
    type PortalSessionUser,
} from '@workspace/bitrix';

/**
 * Полноценный кабинет (state=active). Продукты и статусы компонентов —
 * живые данные GET /cabinet/summary (portal_products +
 * marketplace_install_components).
 */

/**
 * Секция «Подписка и оплаты» СКРЫТА до модерации Маркета.
 *
 * Причина: расчёты идут по прямому договору на услуги внешнего сервиса
 * April, а любые упоминания оплат/подписок ВНУТРИ приложения модерация
 * читает как встроенную монетизацию мимо биллинга Битрикса.
 * TODO(этап 7): вернуть вместе с LicenseService (app.info/ONAPPPAYMENT),
 * переформулировав как «статус договора на внешний сервис».
 */
const SHOW_SUBSCRIPTION_SECTION = false;

/** Каталог продуктов приложения (описания — фронтовая константа) */
const PRODUCT_CATALOG = [
    {
        code: 'sales',
        title: 'Продукт Sales',
        description:
            'Звонки, конструктор КП, отчёты. Плейсменты и сущности CRM.',
    },
    {
        code: 'service',
        title: 'Продукт Service',
        description: 'Сервисное направление. Доступен только вместе с Sales.',
    },
] as const;

/** Человекочитаемые названия осей компонентов */
const COMPONENT_TYPE_TITLES: Record<string, string> = {
    placement: 'Виджеты (встройки)',
    smart_scenario: 'Умные сценарии',
    pbx_entities: 'Поля и процессы CRM',
};

const componentStatusView = (component: CabinetComponent) => {
    switch (component.status) {
        case 'installed':
            return {
                icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
                label: 'установлено',
            };
        case 'installing':
            return {
                icon: (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ),
                label: 'устанавливается…',
            };
        case 'error':
            return {
                icon: <XCircle className="h-4 w-4 text-red-600" />,
                label: 'ошибка установки',
            };
        case 'skipped':
            return {
                icon: <MinusCircle className="h-4 w-4 text-gray-400" />,
                label:
                    component.reasonCode === 'tariff_restricted'
                        ? 'недоступно на тарифе'
                        : component.reasonCode === 'bitrix_archive'
                          ? 'устанавливается Битриксом'
                          : 'пропущено',
            };
        default:
            return {
                icon: <CircleDashed className="h-4 w-4 text-gray-400" />,
                label:
                    component.reasonCode === 'awaiting_approval'
                        ? 'после одобрения'
                        : 'ожидает',
            };
    }
};

export const ActiveCabinet = ({
    domain,
    user,
}: {
    domain?: string;
    user?: PortalSessionUser;
}) => {
    const [summary, setSummary] = useState<CabinetSummary | null>(null);
    const [summaryError, setSummaryError] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [installError, setInstallError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getCabinetSummary()
            .then((data) => {
                if (!cancelled) setSummary(data);
            })
            .catch((error) => {
                // Сессию обрабатывает стор (экран сменится сам); прочие
                // ошибки — показываем каркас без живых данных.
                if (!cancelled && !(error instanceof SessionExpiredError)) {
                    setSummaryError(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    /**
     * Кнопка «Установить продукт» — путь, когда код подключения выпущен без
     * автоматической установки (auto_provision=false): продукт у портала
     * есть, но сущности не ставились. Она же будущая точка входа мастера
     * настройки (back/ai/tasks/bitrix-marketplace-setup-wizard.md).
     */
    const onInstall = async () => {
        setInstalling(true);
        setInstallError(null);
        try {
            await installProduct();
            // Статусы компонентов поедут в очереди — перечитываем сводку
            setSummary(await getCabinetSummary());
        } catch (error) {
            if (error instanceof SessionExpiredError) {
                return; // стор уже expired → CabinetRoot покажет экран
            }
            setInstallError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось запустить установку — попробуйте ещё раз',
            );
        } finally {
            setInstalling(false);
        }
    };

    const products = PRODUCT_CATALOG.map((item) => {
        const portalProduct = summary?.products.find(
            (product) => product.code === item.code,
        );
        return {
            ...item,
            active: portalProduct?.status === 'active',
            // установку запускаем только для sales: ручка бэка ставит его
            // (service идёт прицепом), и только если продукт уже заведён
            installable:
                item.code === 'sales' &&
                portalProduct !== undefined &&
                portalProduct.status !== 'active',
        };
    });

    // Компоненты группируем по оси; агрегат pbx_entities (пустой код)
    // показываем как общий статус оси, шаги — списком под ним.
    const componentsByType = (summary?.components ?? []).reduce<
        Record<string, CabinetComponent[]>
    >((groups, component) => {
        (groups[component.componentType] ??= []).push(component);
        return groups;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-6 py-8">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Менеджер Гарант
                        </h1>
                        <p className="mt-1 text-gray-600">
                            {user?.name ? `Здравствуйте, ${user.name}! ` : ''}
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
                        <Badge
                            variant="outline"
                            className="border-green-200 text-green-700"
                        >
                            Подключение активно
                        </Badge>
                        {summary?.organization?.name && (
                            <Badge variant="outline" className="text-gray-600">
                                {summary.organization.name}
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
                                    {product.installable && (
                                        <div className="mt-3">
                                            <Button
                                                size="sm"
                                                disabled={installing}
                                                onClick={() =>
                                                    void onInstall()
                                                }
                                            >
                                                {installing
                                                    ? 'Запускаем установку…'
                                                    : 'Установить продукт'}
                                            </Button>
                                            {installError && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {installError}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {SHOW_SUBSCRIPTION_SECTION && (
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
                                        Раздел в разработке. Здесь появятся
                                        статус договора, срок действия и
                                        история оплат.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

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
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>Приложение установлено</span>
                                </div>
                                {!summary && !summaryError && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Загружаем статусы…</span>
                                    </div>
                                )}
                                {summaryError && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <CircleDashed className="h-4 w-4" />
                                        <span>
                                            Статусы компонентов временно
                                            недоступны
                                        </span>
                                    </div>
                                )}
                                {Object.entries(componentsByType).map(
                                    ([type, components]) => (
                                        <div key={type} className="space-y-1">
                                            <p className="text-sm font-medium text-gray-700">
                                                {COMPONENT_TYPE_TITLES[type] ??
                                                    type}
                                            </p>
                                            {components.map((component) => {
                                                const view =
                                                    componentStatusView(
                                                        component,
                                                    );
                                                return (
                                                    <div
                                                        key={`${component.productCode}:${component.componentType}:${component.componentCode}`}
                                                        className="flex items-center gap-2 pl-2 text-sm text-gray-600"
                                                    >
                                                        {view.icon}
                                                        <span>
                                                            {component.componentCode ===
                                                            ''
                                                                ? `Все компоненты (${component.productCode})`
                                                                : component.componentCode}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            — {view.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ),
                                )}
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
};
