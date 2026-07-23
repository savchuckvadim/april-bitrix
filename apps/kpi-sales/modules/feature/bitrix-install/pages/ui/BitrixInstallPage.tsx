'use client';

import { useEffect, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { finishInstall } from '@workspace/bitrix';

/**
 * Экран завершения установки Bitrix-приложения: вызывает installFinish
 * через официальный b24jssdk (@workspace/bitrix) — Битрикс закрывает
 * мастер установки. Токены сохраняет бэк (см. app/api/bitrix/install).
 */
export default function InstallPage() {
    const [status, setStatus] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const result = await finishInstall();
                setStatus(result ? 'success' : 'fail');
            } catch (err) {
                console.error('Ошибка при вызове installFinish:', err);
                setStatus('fail');
            }
        })();
    }, []);

    let message = '⏳ Ожидание установки...';
    if (status === 'success') {
        message = '✅ Установка прошла успешно!';
    } else if (status === 'fail') {
        message = '❌ Ошибка установки.';
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background min-h-svh">
            <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">
                    Статус установки
                </h1>
                <p className="text-muted-foreground">{message}</p>
                <Link href="/report">
                    <Button size="sm">На главную</Button>
                </Link>
            </div>
        </div>
    );
}
