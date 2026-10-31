import type { Metadata } from 'next';
import { PublicApp, PublicProviders } from '@/modules/public-app';

export const metadata: Metadata = {
    title: 'Конструктор комплектов',
    robots: { index: false, follow: false },
    // токен в адресе: не уносим его на внешние сайты через Referer
    referrer: 'no-referrer',
};

/** Публичная версия по ссылке из админки: без Битрикса, пользователя и документов. */
export default async function PublicLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ token: string }>;
}>) {
    const { token } = await params;

    return (
        <PublicProviders>
            <PublicApp token={token}>{children}</PublicApp>
        </PublicProviders>
    );
}
