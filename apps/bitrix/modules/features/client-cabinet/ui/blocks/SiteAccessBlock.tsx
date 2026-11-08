'use client';

import { useState } from 'react';
import { AButton, AInput, SectionCard } from '@workspace/april-ui';
import {
    getFrameCabinetAccess,
    requestFrameCabinetAccess,
    type PortalSessionUser,
} from '@workspace/bitrix';
import { useCabinetAction, useCabinetLoad } from '../../lib/cabinet-hooks';
import { SITE_LOGIN_URL } from '../../lib/cabinet-texts';

type Field = 'email' | 'lastName' | 'firstName';

/**
 * Во фрейме Битрикса: доступ к кабинету с сайта (без Битрикса). Есть —
 * подсказка, как войти; нет — заявка, которую подтверждает владелец
 * кабинета или April. До подтверждения заявка прав не даёт.
 */
export const SiteAccessBlock = ({ user }: { user?: PortalSessionUser }) => {
    const status = useCabinetLoad(() => getFrameCabinetAccess(), []);
    const action = useCabinetAction();
    const [form, setForm] = useState<Record<Field, string>>({
        email: user?.email ?? '',
        lastName: user?.lastName ?? '',
        firstName: user?.name ?? '',
    });

    const submit = async () => {
        const result = await action.run(() =>
            requestFrameCabinetAccess({
                email: form.email.trim(),
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
            }),
        );
        if (result) status.reload();
    };

    const role = status.data?.role ?? null;
    const body = () => {
        if (status.loading) return <p className="text-sm text-muted-foreground">Проверяем…</p>;
        if (role === 'owner' || role === 'member') {
            return (
                <p className="text-sm">
                    Доступ есть ({status.data?.emailMasked}). Войти без Битрикса:{' '}
                    <a href={SITE_LOGIN_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        bitrix.april-app.ru
                    </a>
                    {status.data?.hasPassword
                        ? '.'
                        : '. Пароль ещё не задан — ссылка пришла на почту; не пришла — «Забыли пароль?» на странице входа.'}
                </p>
            );
        }
        if (role === 'pending') {
            return (
                <p className="text-sm">
                    Заявка на доступ отправлена ({status.data?.emailMasked}). Её подтвердит
                    владелец кабинета вашей организации или April — после этого на почту
                    придёт ссылка для пароля.
                </p>
            );
        }
        return (
            <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                    Кабинет можно открывать и с сайта, без Битрикс24. Оставьте заявку — её
                    подтвердит владелец кабинета вашей организации или April.
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                    {(['email', 'lastName', 'firstName'] as const).map((name) => (
                        <AInput<Field>
                            key={name}
                            label={name === 'email' ? 'Email' : name === 'lastName' ? 'Фамилия' : 'Имя'}
                            type={name === 'email' ? 'email' : 'text'}
                            errorMessage={null}
                            nameForHandler={name}
                            value={form[name]}
                            handleChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
                            handleOnFocus={() => action.clearError()}
                        />
                    ))}
                </div>
                <div className="w-56">
                    <AButton
                        title={action.busy ? 'Отправляем…' : 'Попросить доступ'}
                        isActive={!action.busy && form.email.includes('@') && form.firstName.trim() !== '' && form.lastName.trim() !== ''}
                        clickHendler={() => void submit()}
                    />
                </div>
            </div>
        );
    };

    return (
        <SectionCard title="Доступ с сайта" description="Кабинет April вне Битрикс24 — по email и паролю.">
            {body()}
            {(action.error || status.error) && (
                <p className="mt-2 text-sm text-destructive">{action.error ?? status.error}</p>
            )}
        </SectionCard>
    );
};
