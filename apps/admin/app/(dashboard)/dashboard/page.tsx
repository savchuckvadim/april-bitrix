'use client';

import * as React from 'react';
import { useClients } from '@/modules/entities/client/lib/hooks';
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
    Store,
    Activity,
    ArrowRight,
    Plus,
    KeyRound,
} from 'lucide-react';

export default function DashboardPage() {
    const { data: clients, isLoading: clientsLoading } = useClients({
        is_active: 'true',
        status: 'active',
    });

    const stats = React.useMemo(() => {
        const totalClients = Array.isArray(clients) ? clients.length : 0;
        const activeClients = Array.isArray(clients)
            ? clients.filter((c) => c.is_active).length
            : 0;

        return {
            totalClients,
            activeClients,
            inactiveClients: totalClients - activeClients,
        };
    }, [clients]);

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
                            Маркетплейс
                        </CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/marketplace/applications">
                                Заявки на подключение
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Секреты приложений
                        </CardTitle>
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/marketplace/secrets">
                                OAuth-креды
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
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
                                <Link href="/client">
                                    <Users className="mr-2 h-4 w-4" />
                                    Все клиенты
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/client/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Добавить
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Маркетплейс «Менеджер Гарант»</CardTitle>
                        <CardDescription>
                            Заявки на подключение, установки и статусы порталов
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button asChild className="flex-1">
                                <Link href="/marketplace/applications">
                                    <Store className="mr-2 h-4 w-4" />
                                    Заявки
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/marketplace/installs">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Установки
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
                                <Link href="/client">
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
                                            <Link href={`/client/${client.id}`}>
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

