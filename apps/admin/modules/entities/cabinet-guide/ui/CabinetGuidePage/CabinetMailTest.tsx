'use client';

import { useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useCabinetMailTest } from '../../lib/hooks/use-cabinet-checks';

/**
 * Проверка почты: тестовое письмо тем же SMTP, которым уходят ссылки на
 * пароль и коды подключения. Ошибка SMTP показывается как есть.
 */
export const CabinetMailTest = () => {
    const [email, setEmail] = useState('');
    const test = useCabinetMailTest();
    const valid = /^\S+@\S+\.\S+$/.test(email.trim());

    return (
        <SectionCard
            title="Проверить почту"
            description="Отправить тестовое письмо — так же уходят ссылки на пароль и коды подключения."
        >
            <div className="flex flex-wrap items-center gap-2">
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
                <p className={test.data.ok ? 'mt-2 text-sm' : 'mt-2 text-sm text-destructive'}>
                    {test.data.message}
                </p>
            )}
        </SectionCard>
    );
};
