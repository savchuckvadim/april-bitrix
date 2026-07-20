'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { ShieldAlert, RefreshCw, Ban } from 'lucide-react';
import type { ReactNode } from 'react';

/** Единая почта поддержки (совпадает с карточкой Маркета и юр-страницами) */
const SUPPORT_EMAIL = 'april-app@mail.ru';

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

/*
 * Экран состояния pending живёт не здесь: ожидание кода показывается
 * блоком внутри ConnectScreen, чтобы поле ввода кода оставалось на виду.
 *
 * ФОРМУЛИРОВКИ (общее правило для всех экранов ниже): приложение подаётся
 * в Маркет как клиентский интерфейс внешнего сервиса. Тексты описывают
 * ОТСУТСТВИЕ подключения к внешней инфраструктуре, а не «выключенный
 * функционал» — правило Маркета «функционал не должен включаться/
 * выключаться по условиям» (docs: ai/marketplace/publication/00-README.md,
 * раздел «Позиционирование»).
 */

/** Подключение к внешнему сервису приостановлено (договор не действует) */
export const BlockedScreen = ({ domain }: { domain?: string }) => (
    <Screen
        icon={<Ban className="h-5 w-5 text-red-500" />}
        title="Портал отключён от сервиса"
        description="Обмен данными с внешним сервисом April приостановлен"
        domain={domain}
    >
        <p className="text-sm text-gray-600">
            Подключение портала к серверной инфраструктуре April не
            действует. Чтобы возобновить обмен данными, свяжитесь с нами:{' '}
            {SUPPORT_EMAIL}.
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
