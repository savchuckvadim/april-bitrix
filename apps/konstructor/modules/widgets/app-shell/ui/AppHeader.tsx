'use client';

import { useClientHeader } from '../hooks/use-client-header';
import { ClientIdentity } from './ClientIdentity';
import { ClientStrip } from './ClientStrip';
import { ShellActions } from './ShellActions';

/**
 * Шапка приложения — родственная шапке «Звонков» и на тех же компонентах
 * (@workspace/april-ui/entity): кто клиент, прогноз, статус, ИНН и действия.
 * Одна над всеми экранами, при переходах не пересоздаётся.
 */
export const AppHeader = () => {
    const client = useClientHeader();

    return (
        <header className="z-20 shrink-0 border-b bg-background">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 lg:px-6">
                <ClientIdentity
                    title={client.identity.title}
                    href={client.identity.href}
                    kindLabel={client.identity.kindLabel}
                    deal={client.deal}
                />
                <ClientStrip
                    prospect={client.prospect}
                    status={client.status}
                    inn={client.inn}
                />
                <ShellActions />
            </div>
        </header>
    );
};
