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
/**
 * Абсолютные URL сайта приложения: кабинет живёт в iframe Битрикса, ссылки
 * должны открываться новой вкладкой браузера (target=_blank), а не в раме.
 */
const SUPPORT_PAGE_URL = 'https://bitrix.april-app.ru/support';
const PRIVACY_PAGE_URL = 'https://bitrix.april-app.ru/legal/privacy';

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

/**
 * Доступ к внешнему сервису не предоставлен: договор не действует ЛИБО
 * право на подключение не подтверждено (заявитель не является партнёром).
 * По решению владельца (2026-07-21) с этого экрана нельзя ни ввести код,
 * ни подать заявку (бэк тоже отвечает 403) — только контакты и политика
 * конфиденциальности (п. 5.6/6.6: возможность подачи заявки может быть
 * ограничена Оператором).
 */
export const BlockedScreen = ({ domain }: { domain?: string }) => (
    <Screen
        icon={<Ban className="h-5 w-5 text-red-500" />}
        title="Доступ к сервису не предоставлен"
        description="Подключение портала к внешнему сервису April не действует"
        domain={domain}
    >
        <p className="text-sm text-gray-600">
            Подключение к сервису April предоставляется организациям,
            сотрудничающим с нами по договору на настройку и сопровождение.
            Если вы считаете, что доступ ограничен по ошибке, или хотите
            обсудить подключение — свяжитесь с нами: {SUPPORT_EMAIL}.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
            <a
                href={SUPPORT_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline"
            >
                Контакты и поддержка ↗
            </a>
            <a
                href={PRIVACY_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline"
            >
                Политика конфиденциальности ↗
            </a>
        </div>
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
