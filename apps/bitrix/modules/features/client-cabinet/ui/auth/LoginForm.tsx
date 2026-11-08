'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AButton, AInput } from '@workspace/april-ui';
import { siteSession } from '@workspace/bitrix';
import { cabinetErrorText, useSiteSession } from '../../lib/cabinet-hooks';
import { AuthShell } from './AuthShell';

type Field = 'email' | 'password';

/**
 * Вход в кабинет с сайта. Регистрации нет: доступ выдаёт владелец кабинета
 * организации или April, пароль задаётся по ссылке из письма.
 */
export const LoginForm = () => {
    const router = useRouter();
    const session = useSiteSession();
    const [form, setForm] = useState<Record<Field, string>>({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // Уже вошли (cookie жива) — сразу в кабинет
    useEffect(() => {
        if (session.status === 'ready') router.replace('/account');
    }, [session.status, router]);

    const set = (name: Field, value: string) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    const submit = async () => {
        setBusy(true);
        setError(null);
        try {
            await siteSession.login(form.email.trim(), form.password);
            router.replace('/account');
        } catch (failure) {
            setError(cabinetErrorText(failure, 'Не удалось войти'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            title="Вход в кабинет April"
            description="Для сотрудников организаций-клиентов April. Из Битрикс24 кабинет открывается без пароля — пунктом «April» в левом меню."
        >
            <AInput<Field>
                label="Email"
                type="email"
                autoComplete="email"
                errorMessage={null}
                nameForHandler="email"
                value={form.email}
                handleChange={set}
                handleOnFocus={() => setError(null)}
            />
            <AInput<Field>
                label="Пароль"
                type="password"
                autoComplete="current-password"
                errorMessage={null}
                nameForHandler="password"
                value={form.password}
                handleChange={set}
                handleOnFocus={() => setError(null)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <AButton
                title={busy ? 'Входим…' : 'Войти'}
                isActive={!busy && form.email.includes('@') && form.password.length > 0}
                clickHendler={() => void submit()}
            />
            <div className="flex justify-between text-sm">
                <Link href="/auth/forgot-password" className="text-primary hover:underline">
                    Забыли пароль?
                </Link>
            </div>
            <p className="text-xs text-muted-foreground">
                Нет доступа? Попросите владельца кабинета вашей организации или
                откройте April в Битрикс24 и нажмите «Доступ с сайта».
            </p>
        </AuthShell>
    );
};
