'use client';

import { useState } from 'react';
import { ToneBadge } from '@workspace/april-ui';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import type { MailTransportStatus } from '../../lib/api/cabinet-checks-helper';
import { useCabinetMailTest, useMailStatus } from '../../lib/hooks/use-cabinet-checks';

/** Что задано для почты на сервере: адрес, ящик, отправитель, замечания. */
function MailStatusLines({ status }: { status: MailTransportStatus }) {
    if (!status.configured) {
        return <p className="text-sm text-destructive">{status.warnings.join(' ')}</p>;
    }
    return (
        <div className="space-y-1 text-sm">
            <p>
                Сервер: <span className="font-mono">{status.host}:{status.port ?? '—'}</span>
                <span className="text-muted-foreground"> · {status.secure ? 'SSL' : 'STARTTLS'}</span>
            </p>
            <p>
                Ящик: <span className="font-mono">{status.login ?? '—'}</span>
                <span className="text-muted-foreground">
                    {' '}
                    · пароль {status.passwordSet ? 'задан' : 'не задан'}
                </span>
            </p>
            <p>
                Отправитель: <span className="font-mono">{status.from}</span>
            </p>
            {status.warnings.map((warning) => (
                <p key={warning} className="text-xs text-warning">
                    {warning}
                </p>
            ))}
        </div>
    );
}

/**
 * Почта сервера April: что настроено (MAIL_*, SMTP_FROM — корневой .env) и
 * тестовое письмо тем же SMTP, которым уходят ссылки на пароль и коды
 * подключения. Отказ — с причиной; если не соединились — с пробой DNS и
 * портов 465/587 с сервера. Ошибка пишется и в журнал приложения admin.
 */
export const MailCheckCard = () => {
    const [email, setEmail] = useState('');
    const status = useMailStatus();
    const test = useCabinetMailTest();
    const valid = /^\S+@\S+\.\S+$/.test(email.trim());
    const configured = status.data?.configured;

    return (
        <SectionCard
            title="Почта"
            description="Исходящая почта: ссылки на пароль кабинета и коды подключения. Задаётся в корневом .env сервера (MAIL_HOST, MAIL_PORT, MAIL_LOGIN, MAIL_PASSWORD, SMTP_FROM); после правки пересоздайте admin и pbx."
            actions={
                configured === undefined ? undefined : (
                    <ToneBadge tone={configured ? 'success' : 'destructive'} variant="soft">
                        {configured ? 'настроена' : 'не настроена'}
                    </ToneBadge>
                )
            }
        >
            {status.isLoading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
            {status.isError && (
                <p className="text-sm text-destructive">
                    Настройка не загрузилась: {getApiErrorMessage(status.error)}
                </p>
            )}
            {status.data && <MailStatusLines status={status.data} />}

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <Input
                    type="email"
                    value={email}
                    placeholder="name@example.ru"
                    autoComplete="off"
                    className="max-w-xs"
                    onChange={(event) => setEmail(event.target.value)}
                />
                <Button
                    size="sm"
                    disabled={!valid || test.isPending}
                    onClick={() => test.mutate(email.trim())}
                >
                    {test.isPending ? 'Отправляю…' : 'Отправить тестовое письмо'}
                </Button>
            </div>
            {test.data && (
                <div className="mt-2 space-y-1">
                    <p className={test.data.ok ? 'text-sm' : 'text-sm text-destructive'}>
                        {test.data.message}
                    </p>
                    {test.data.details.length > 0 && (
                        <ul className="space-y-0.5 rounded-md bg-muted/50 p-2 text-xs">
                            {test.data.details.map((line) => (
                                <li key={line} className="font-mono">
                                    {line}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </SectionCard>
    );
};
