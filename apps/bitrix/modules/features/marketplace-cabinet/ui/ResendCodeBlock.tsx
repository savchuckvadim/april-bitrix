'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Check, Mail } from 'lucide-react';
import { requestInviteCode, SessionExpiredError } from '@workspace/bitrix';

/**
 * «Код не пришёл» — повторный запрос кода подключения.
 *
 * По умолчанию одна кнопка: выслать на контактный адрес организации,
 * никакого выбора. Отправку на ДРУГОЙ адрес показываем только
 * администратору портала — бэк это же и проверяет (ai/tasks/
 * bitrix-marketplace-client-identity.md). Контактный email организации
 * при этом не меняется: адрес относится к конкретному коду.
 */
export const ResendCodeBlock = ({
    emailMasked,
    canUseAnotherAddress,
}: {
    /** Маскированный контактный адрес организации («d***r@dom.ru») */
    emailMasked?: string;
    /** Пользователь — администратор портала Битрикс24 */
    canUseAnotherAddress: boolean;
}) => {
    const [anotherOpen, setAnotherOpen] = useState(false);
    const [anotherEmail, setAnotherEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sentTo, setSentTo] = useState<string | null>(null);

    const request = async (deliveryEmail?: string) => {
        setSubmitting(true);
        setError(null);
        try {
            const result = await requestInviteCode(deliveryEmail);
            setSentTo(result.deliveryEmailMasked);
            setAnotherOpen(false);
            setAnotherEmail('');
        } catch (requestError) {
            if (requestError instanceof SessionExpiredError) {
                return; // стор уже expired → CabinetRoot покажет экран
            }
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Не удалось отправить запрос — попробуйте ещё раз',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const onSubmitAnother = (event: FormEvent) => {
        event.preventDefault();
        void request(anotherEmail);
    };

    if (sentTo) {
        return (
            <p className="mt-3 flex items-start gap-2 text-sm text-green-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                Запрос принят — вышлем код на {sentTo}. Если письмо не придёт в
                течение рабочего дня, напишите нам.
            </p>
        );
    }

    return (
        <div className="mt-3">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={() => void request()}
                >
                    <Mail className="mr-2 h-4 w-4" />
                    {submitting
                        ? 'Отправляем…'
                        : emailMasked
                          ? `Выслать код повторно на ${emailMasked}`
                          : 'Выслать код повторно'}
                </Button>
                {canUseAnotherAddress && !anotherOpen && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAnotherOpen(true)}
                    >
                        На другой адрес
                    </Button>
                )}
            </div>

            {anotherOpen && (
                <form onSubmit={onSubmitAnother} className="mt-3 space-y-2">
                    <label
                        htmlFor="deliveryEmail"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Адрес для этого письма
                    </label>
                    <input
                        id="deliveryEmail"
                        type="email"
                        required
                        value={anotherEmail}
                        onChange={(event) =>
                            setAnotherEmail(event.target.value)
                        }
                        placeholder="new-director@romashka.ru"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500">
                        Контактный email организации останется прежним — адрес
                        относится только к этому письму.
                    </p>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? 'Отправляем…' : 'Запросить код'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAnotherOpen(false)}
                        >
                            Отмена
                        </Button>
                    </div>
                </form>
            )}

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};
