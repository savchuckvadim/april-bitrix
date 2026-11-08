'use client';

import { AccountGate } from '@/modules/features/client-cabinet';

/**
 * Кабинет клиента на сайте (`/account`): открыт только после входа по
 * email и паролю. Сессия — в памяти вкладки + refresh-cookie api.pbx.
 */
export default function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AccountGate>{children}</AccountGate>;
}
