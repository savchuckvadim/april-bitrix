'use client';

import { useRouter } from "next/navigation";
import { useBxInstall } from "../lib/hook/bx-install.hook";
import { useEffect } from "react";

export const BxInstall = () => {
    const router = useRouter();
    const { isInstalled, isLoading, error } = useBxInstall();

    useEffect(() => {
        if (isInstalled) {
            router.replace('/bitrix'); // replace, не push
        }
    }, [isInstalled, router]);

    if (isLoading) {
        return <p className="text-white">⏳ Ожидание установки...</p>;
    }

    if (error) {
        return (
            <>
                <p className="text-white">❌ Ошибка установки</p>
                <p className="text-red-400">{error.message}</p>
            </>
        );
    }

    return <p className="text-white">✅ Установка завершена</p>;
};
