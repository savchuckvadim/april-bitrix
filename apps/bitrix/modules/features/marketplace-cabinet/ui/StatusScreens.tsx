'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Clock, ShieldAlert, RefreshCw, Ban } from 'lucide-react';
import type { ReactNode } from 'react';

/** Общая обёртка статус-экранов кабинета */
const Screen = ({
    icon,
    title,
    description,
    domain,
    children,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    domain?: string;
    children?: ReactNode;
}) => (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {domain && (
                    <Badge variant="outline">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                        {domain}
                    </Badge>
                )}
                {children}
            </CardContent>
        </Card>
    </div>
);

/** Заявка подана — ждём одобрения вендора */
export const PendingScreen = ({
    domain,
    organizationName,
}: {
    domain?: string;
    organizationName?: string;
}) => (
    <Screen
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        title="Заявка на рассмотрении"
        description="Мы получили вашу заявку на подключение «Менеджер Гарант»"
        domain={domain}
    >
        <p className="text-sm text-gray-600">
            {organizationName
                ? `Организация «${organizationName}» ожидает подтверждения. `
                : ''}
            Мы свяжемся с вами по указанному email после проверки — обычно
            это занимает один рабочий день.
        </p>
    </Screen>
);

/** Доступ отключён вендором */
export const BlockedScreen = ({ domain }: { domain?: string }) => (
    <Screen
        icon={<Ban className="h-5 w-5 text-red-500" />}
        title="Доступ отключён"
        description="Работа приложения для вашего портала приостановлена"
        domain={domain}
    >
        <p className="text-sm text-gray-600">
            Свяжитесь с поддержкой вендора, чтобы восстановить доступ.
        </p>
    </Screen>
);

/** Открытие не прошло верификацию / нет сессии */
export const UnauthorizedScreen = () => (
    <Screen
        icon={<ShieldAlert className="h-5 w-5 text-red-500" />}
        title="Не удалось подтвердить доступ"
        description="Страница открыта вне Битрикс24 или сессия не выдана"
    >
        <p className="text-sm text-gray-600">
            Откройте приложение «Менеджер Гарант» из левого меню вашего
            портала Битрикс24.
        </p>
    </Screen>
);

/** Сессия истекла (401 от API) */
export const SessionExpiredScreen = () => (
    <Screen
        icon={<RefreshCw className="h-5 w-5 text-amber-500" />}
        title="Сессия истекла"
        description="Токен доступа кабинета устарел"
    >
        <p className="text-sm text-gray-600">
            Переоткройте приложение из меню Битрикс24 — сессия выдаётся
            заново при каждом открытии.
        </p>
    </Screen>
);

/** Спиннер начальной загрузки */
export const LoadingScreen = () => (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">⏳ Загрузка кабинета…</p>
    </div>
);
