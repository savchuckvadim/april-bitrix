'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AButton, PreloaderScreen } from '@workspace/april-ui';
import { siteSession } from '@workspace/bitrix';
import { useSiteSession } from '../../lib/cabinet-hooks';

/**
 * Кабинет на сайте открыт только после входа. Сессия восстанавливается по
 * refresh-cookie; не вошли — на страницу входа. Шапка: April и «Выйти».
 */
export const AccountGate = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const session = useSiteSession();

    useEffect(() => {
        if (session.status === 'anonymous') router.replace('/auth/login');
    }, [session.status, router]);

    if (session.status !== 'ready') {
        return <PreloaderScreen variant="minimal" title="Кабинет April" />;
    }

    const logout = async () => {
        await siteSession.logout();
        router.replace('/auth/login');
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="border-b bg-background">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
                    <Link href="/account" className="font-semibold">
                        April — кабинет
                    </Link>
                    <div className="w-28">
                        <AButton
                            title="Выйти"
                            size="small"
                            color="grey"
                            clickHendler={() => void logout()}
                        />
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        </div>
    );
};
