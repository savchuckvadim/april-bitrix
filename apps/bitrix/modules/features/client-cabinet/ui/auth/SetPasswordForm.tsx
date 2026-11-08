'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AButton, AInput, Spinner } from '@workspace/april-ui';
import { inspectPasswordLink, setCabinetPassword } from '@workspace/bitrix';
import { useCabinetAction, useCabinetLoad } from '../../lib/cabinet-hooks';
import { passwordProblem } from '../../lib/cabinet-texts';
import { AuthShell } from './AuthShell';

type Field = 'password' | 'repeat';

/**
 * Пароль по ссылке из письма: первый (приглашение в кабинет) или новый
 * (восстановление). Ссылка одноразовая — после сохранения гаснет.
 */
export const SetPasswordForm = ({ token }: { token: string }) => {
    const link = useCabinetLoad(() => inspectPasswordLink(token), [token]);
    const action = useCabinetAction();
    const [form, setForm] = useState<Record<Field, string>>({
        password: '',
        repeat: '',
    });
    const [done, setDone] = useState(false);

    const problem =
        form.password.length > 0 ? passwordProblem(form.password) : null;
    const mismatch =
        form.repeat.length > 0 && form.repeat !== form.password
            ? 'Пароли не совпадают'
            : null;

    const submit = async () => {
        const result = await action.run(() =>
            setCabinetPassword(token, form.password),
        );
        if (result) setDone(true);
    };

    if (link.loading) {
        return (
            <AuthShell title="Пароль">
                <Spinner />
            </AuthShell>
        );
    }

    if (!link.data?.valid) {
        return (
            <AuthShell title="Ссылка не действует">
                <p className="text-sm">
                    Ссылка устарела или уже использована. Запросите новую — она
                    придёт на почту учётной записи.
                </p>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Запросить новую ссылку
                </Link>
            </AuthShell>
        );
    }

    if (done) {
        return (
            <AuthShell title="Пароль сохранён">
                <p className="text-sm">Теперь можно войти в кабинет с сайта.</p>
                <Link href="/auth/login" className="text-sm text-primary hover:underline">
                    Войти
                </Link>
            </AuthShell>
        );
    }

    const isSetup = link.data.purpose === 'setup';
    return (
        <AuthShell
            title={isSetup ? 'Пароль для кабинета April' : 'Новый пароль'}
            description={
                link.data.emailMasked
                    ? `Учётная запись: ${link.data.emailMasked}`
                    : undefined
            }
        >
            <AInput<Field>
                label="Пароль"
                type="password"
                autoComplete="new-password"
                errorMessage={problem}
                nameForHandler="password"
                value={form.password}
                handleChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))}
                handleOnFocus={() => action.clearError()}
            />
            <AInput<Field>
                label="Повторите пароль"
                type="password"
                autoComplete="new-password"
                errorMessage={mismatch}
                nameForHandler="repeat"
                value={form.repeat}
                handleChange={(name, value) => setForm((prev) => ({ ...prev, [name]: value }))}
                handleOnFocus={() => action.clearError()}
            />
            <p className="text-xs text-muted-foreground">
                Не короче 8 символов, хотя бы одна цифра и одна буква.
            </p>
            {action.error && <p className="text-sm text-destructive">{action.error}</p>}
            <AButton
                title={action.busy ? 'Сохраняем…' : 'Сохранить пароль'}
                isActive={
                    !action.busy &&
                    form.password.length > 0 &&
                    !problem &&
                    form.repeat === form.password
                }
                clickHendler={() => void submit()}
            />
        </AuthShell>
    );
};
