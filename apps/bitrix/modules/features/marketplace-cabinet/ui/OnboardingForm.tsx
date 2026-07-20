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
import { Handshake } from 'lucide-react';
import {
    submitOnboardingApplication,
    SessionExpiredError,
    type PortalSessionUser,
} from '@workspace/bitrix';

/**
 * Блок «Запросить код подключения»: два поля (организация + контактный
 * email). Второстепенный путь — основной это ввод уже полученного кода
 * (см. InviteCodeForm); отсюда клиент только просит выдать ему код.
 *
 * Email предзаполняется из Bitrix-профиля. Успешная подача переводит стор
 * в state=pending — ConnectScreen перерисуется сам (usePortalSession).
 *
 * Секция, а не экран: обёртку страницы даёт ConnectScreen.
 */
export const OnboardingForm = ({
    user,
    title = 'Запросить код подключения',
    description = 'Оставьте контакты — мы отправим код на указанный email.',
}: {
    user?: PortalSessionUser;
    title?: string;
    description?: string;
}) => {
    const [organizationName, setOrganizationName] = useState('');
    // ФИО и email предзаполняются из Bitrix-профиля (user.current): форма —
    // подтверждение уже известных данных, а не ручной ввод.
    const [lastName, setLastName] = useState(user?.lastName ?? '');
    const [firstName, setFirstName] = useState(user?.name ?? '');
    const [contactEmail, setContactEmail] = useState(user?.email ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await submitOnboardingApplication({
                organizationName: organizationName.trim(),
                lastName: lastName.trim(),
                firstName: firstName.trim(),
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Handshake className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(event) => void onSubmit(event)}
                    className="space-y-4"
                >
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
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                htmlFor="lastName"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Фамилия
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                required
                                maxLength={255}
                                value={lastName}
                                onChange={(event) =>
                                    setLastName(event.target.value)
                                }
                                placeholder="Иванов"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="firstName"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Имя
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                required
                                maxLength={255}
                                value={firstName}
                                onChange={(event) =>
                                    setFirstName(event.target.value)
                                }
                                placeholder="Пётр"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
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
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button
                        type="submit"
                        variant="outline"
                        className="w-full"
                        disabled={submitting}
                    >
                        {submitting ? 'Отправляем…' : 'Запросить код'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
