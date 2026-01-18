'use client';

import * as React from 'react';
import { useClients } from '@/modules/entities/client/lib/hooks';
import { useBitrixApps } from '@/modules/entities/bitrix-app/lib/hooks';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import {
    Users,
    Settings,
    TrendingUp,
    Activity,
    ArrowRight,
    Plus,
} from 'lucide-react';
import { AdminBitrixAppGetAppCode } from '@workspace/nest-api';

export default function DashboardPage() {
    const { data: clients, isLoading: clientsLoading } = useClients({
        is_active: 'true',
        status: 'active',
    });
    const { data: apps, isLoading: appsLoading } = useBitrixApps({
        code: AdminBitrixAppGetAppCode.sales_full,
        domain: '.bitrix24.ru',
    });

    const stats = React.useMemo(() => {
        const totalClients = Array.isArray(clients) ? clients.length : 0;
        const activeClients = Array.isArray(clients)
            ? clients.filter((c) => c.is_active).length
            : 0;
        const totalApps = Array.isArray(apps) ? apps.length : 0;
        const installedApps = Array.isArray(apps)
            ? apps.filter((app: any) => app?.status === 'installed').length
            : 0;

        return {
            totalClients,
            activeClients,
            inactiveClients: totalClients - activeClients,
            totalApps,
            installedApps,
            notInstalledApps: totalApps - installedApps,
        };
    }, [clients, apps]);

    const recentClients = React.useMemo(() => {
        if (!Array.isArray(clients)) return [];
        return [...clients]
            .sort((a, b) => {
                const dateA = a.created_at
                    ? new Date(String(a.created_at)).getTime()
                    : 0;
                const dateB = b.created_at
                    ? new Date(String(b.created_at)).getTime()
                    : 0;
                return dateB - dateA;
            })
            .slice(0, 5);
    }, [clients]);

    return (
        <div className="space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Общая информация и статистика
                    </p>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Всего клиентов
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {clientsLoading ? '...' : stats.totalClients}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeClients} активных
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Активные клиенты
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {clientsLoading ? '...' : stats.activeClients}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.inactiveClients} неактивных
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Всего приложений
                        </CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {appsLoading ? '...' : stats.totalApps}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.installedApps} установлено
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Установленные
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {appsLoading ? '...' : stats.installedApps}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.notInstalledApps} не установлено
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Быстрые действия */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Клиенты</CardTitle>
                        <CardDescription>
                            Управление клиентами системы
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.totalClients}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Всего клиентов
                                </p>
                            </div>
                            <Badge
                                variant={
                                    stats.activeClients > 0
                                        ? 'default'
                                        : 'secondary'
                                }
                            >
                                {stats.activeClients} активных
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild className="flex-1">
                                <Link href="/clients">
                                    <Users className="mr-2 h-4 w-4" />
                                    Все клиенты
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/clients/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Добавить
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bitrix Apps</CardTitle>
                        <CardDescription>
                            Управление приложениями Bitrix
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.totalApps}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Всего приложений
                                </p>
                            </div>
                            <Badge
                                variant={
                                    stats.installedApps > 0
                                        ? 'default'
                                        : 'secondary'
                                }
                            >
                                {stats.installedApps} установлено
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild className="flex-1">
                                <Link href="/bitrix-apps">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Все приложения
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/bitrix-apps/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Добавить
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Последние клиенты */}
            {recentClients.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Последние клиенты</CardTitle>
                                <CardDescription>
                                    Недавно добавленные клиенты
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/clients">
                                    Посмотреть все
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentClients.map((client) => (
                                <div
                                    key={client.id}
                                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {client.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {String(client.email || 'Email не указан')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                client.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {client.is_active
                                                ? 'Активен'
                                                : 'Неактивен'}
                                        </Badge>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <Link href={`/clients/${client.id}`}>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

