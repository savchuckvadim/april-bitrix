'use client';

import { FormEvent, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Handshake } from 'lucide-react';
import {
    submitOnboardingApplication,
    SessionExpiredError,
    type PortalSessionUser,
} from '@workspace/bitrix';

/**
 * Онбординг-заявка: два поля (организация + контактный email).
 * Имя пользователя из Bitrix-профиля используется как подсказка.
 * Успешная подача переводит стор в state=pending — кабинет
 * перерисуется сам (usePortalSession).
 */
export const OnboardingForm = ({
    domain,
    user,
}: {
    domain?: string;
    user?: PortalSessionUser;
}) => {
    const [organizationName, setOrganizationName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await submitOnboardingApplication({
                organizationName: organizationName.trim(),
                contactEmail: contactEmail.trim(),
            });
            // state=pending применит стор → экран сменится сам
        } catch (submitError) {
            if (submitError instanceof SessionExpiredError) {
                return; // стор уже expired → CabinetRoot покажет экран
            }
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : 'Не удалось отправить заявку — попробуйте ещё раз',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const greeting = user?.name
        ? `${user.name}${user.lastName ? ` ${user.lastName}` : ''}, представьтесь`
        : 'Представьтесь';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Handshake className="h-5 w-5" />
                        Заявка на подключение
                    </CardTitle>
                    <CardDescription>
                        {greeting}: чтобы начать работу с «Менеджер Гарант»,
                        расскажите, кто вы — мы подтвердим доступ.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {domain && (
                        <Badge variant="outline" className="mb-4">
                            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                            {domain}
                        </Badge>
                    )}
                    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
                        <div>
                            <label
                                htmlFor="organizationName"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Название организации
                            </label>
                            <input
                                id="organizationName"
                                type="text"
                                required
                                minLength={2}
                                maxLength={255}
                                value={organizationName}
                                onChange={(event) =>
                                    setOrganizationName(event.target.value)
                                }
                                placeholder="ООО «Ромашка»"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="contactEmail"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Контактный email
                            </label>
                            <input
                                id="contactEmail"
                                type="email"
                                required
                                value={contactEmail}
                                onChange={(event) =>
                                    setContactEmail(event.target.value)
                                }
                                placeholder="director@romashka.ru"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={submitting}
                        >
                            {submitting
                                ? 'Отправляем…'
                                : 'Отправить заявку'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
