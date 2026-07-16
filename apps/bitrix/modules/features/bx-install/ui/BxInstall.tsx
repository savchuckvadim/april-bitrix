'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useBxInstall } from '../lib/hook/bx-install.hook';
import { Suspense, useEffect } from 'react';

/**
 * Финал установки маркетплейс-приложения «Менеджер Гарант».
 *
 * Сюда редиректит бэкенд-роутер (api.pbx.../bitrix-marketplace/install)
 * с query `?install=success|fail`:
 *  - success → вызываем BX24.installFinish() (без него Битрикс считает
 *    установку незавершённой и не шлёт события) → кабинет;
 *  - fail → бэк НЕ сохранил установку: показываем ошибку и НЕ вызываем
 *    installFinish (иначе Битрикс посчитает провал успехом).
 */
const BxInstallInner = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isFail = searchParams.get('install') === 'fail';
    const domain = searchParams.get('domain');

    const { isInstalled, isLoading, error } = useBxInstall(!isFail);

    useEffect(() => {
        if (isInstalled) {
            router.replace('/cabinet');
        }
    }, [isInstalled, router]);

    if (isFail) {
        return (
            <>
                <p className="text-white">❌ Установка не удалась</p>
                <p className="text-red-400">
                    Не удалось сохранить установку приложения
                    {domain ? ` для портала ${domain}` : ''}. Попробуйте
                    установить приложение ещё раз или свяжитесь с поддержкой.
                </p>
            </>
        );
    }

    if (error) {
        return (
            <>
                <p className="text-white">❌ Ошибка завершения установки</p>
                <p className="text-red-400">{error.message}</p>
            </>
        );
    }

    if (isLoading || !isInstalled) {
        return <p className="text-white">⏳ Ожидание установки...</p>;
    }

    return <p className="text-white">✅ Установка завершена</p>;
};

export const BxInstall = () => (
    <Suspense fallback={<p className="text-white">⏳ Загрузка...</p>}>
        <BxInstallInner />
    </Suspense>
);
