'use client';

import dynamic from 'next/dynamic';

/**
 * Кабинет «Менеджер Гарант» — страница, на которую бэкенд-роутер
 * (POST api.pbx/api/bitrix-marketplace/app → 302) отправляет пользователя
 * при открытии основного приложения из левого меню Битрикс24.
 *
 * Вся логика — в фиче marketplace-cabinet: bootstrap portal-context сессии
 * (обмен одноразового `code` из query на Bearer через @workspace/bitrix)
 * и маршрутизация экранов по состоянию допуска
 * (onboarding / pending / active / blocked / unauthorized / expired).
 * Query-параметрам страница не доверяет.
 *
 * ssr:false — сессия живёт только в памяти браузера (window/fetch),
 * серверный рендер ей не нужен.
 */
const CabinetRoot = dynamic(
    () =>
        import('@/modules/features/marketplace-cabinet').then(
            (mod) => mod.CabinetRoot,
        ),
    {
        ssr: false,
        loading: () => (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-500">⏳ Загрузка кабинета…</p>
            </div>
        ),
    },
);

export default function MarketplaceCabinetPage() {
    return <CabinetRoot />;
}
