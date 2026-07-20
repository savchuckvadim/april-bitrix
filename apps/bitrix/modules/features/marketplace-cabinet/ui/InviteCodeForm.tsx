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
import { KeyRound } from 'lucide-react';
import { redeemInviteCode, SessionExpiredError } from '@workspace/bitrix';

/**
 * Ввод кода подключения — основной путь подключения портала к внешнему
 * сервису April (код приходит на email от вендора).
 *
 * Успешное погашение переводит стор в state=active, и CabinetRoot
 * перерисовывает кабинет сам — здесь ничего дополнительно делать не нужно.
 * Текст ошибки берём с бэка: он намеренно одинаков для неизвестного,
 * истёкшего и отозванного кода (не раскрываем причину), а для перебора
 * приходит 429 со своим сообщением.
 */
export const InviteCodeForm = () => {
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await redeemInviteCode(code);
            // state=active применит стор → экран сменится сам
        } catch (redeemError) {
            if (redeemError instanceof SessionExpiredError) {
                return; // стор уже expired → CabinetRoot покажет экран
            }
            setError(
                redeemError instanceof Error
                    ? redeemError.message
                    : 'Не удалось подключить портал — попробуйте ещё раз',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />У меня есть код подключения
                </CardTitle>
                <CardDescription>
                    Введите код из письма — портал подключится к сервису April
                    сразу.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(event) => void onSubmit(event)}
                    className="space-y-4"
                >
                    <div>
                        <label
                            htmlFor="inviteCode"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Код подключения
                        </label>
                        <input
                            id="inviteCode"
                            type="text"
                            required
                            minLength={8}
                            maxLength={32}
                            autoComplete="off"
                            spellCheck={false}
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            placeholder="GRNT-AB12-CD34"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm tracking-wider uppercase focus:border-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Регистр и дефисы не важны — можно вставить код как
                            есть.
                        </p>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={submitting || code.trim().length < 8}
                    >
                        {submitting ? 'Подключаем…' : 'Подключить портал'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
