'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { IssueInviteDto } from '@workspace/nest-admin-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { getErrorMessage } from '../../../shared';

interface IssueInviteFormProps {
    onSubmit: (values: IssueInviteDto) => void;
    onCancel: () => void;
    isLoading?: boolean;
    error?: Error | null;
}

/**
 * Форма выпуска кода подключения.
 *
 * autoProvision по умолчанию включён — это текущий сценарий «код погашен →
 * продукт ставится сразу». Снятая галка оставляет установку на кнопку
 * клиента (будущий мастер настройки, back/ai/tasks/
 * bitrix-marketplace-setup-wizard.md).
 */
export function IssueInviteForm({
    onSubmit,
    onCancel,
    isLoading = false,
    error,
}: IssueInviteFormProps) {
    const [autoProvision, setAutoProvision] = React.useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IssueInviteDto>({
        defaultValues: {
            email: '',
            organization: '',
            productCode: 'sales',
            ttlDays: 14,
            note: '',
        },
    });

    const submit = (values: IssueInviteDto) => {
        onSubmit({
            ...values,
            organization: values.organization || undefined,
            note: values.note || undefined,
            ttlDays: Number(values.ttlDays),
            autoProvision,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Выпустить код подключения</CardTitle>
                <CardDescription>
                    Код уйдёт письмом на указанный адрес. Клиент вводит его в
                    приложении на своём портале — портал подключается к сервису
                    April.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={handleSubmit(submit)}
                    className="max-w-lg space-y-4"
                >
                    <div className="space-y-1">
                        <Label htmlFor="email">Email получателя</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="director@romashka.ru"
                            {...register('email', {
                                required: 'Укажите email получателя',
                            })}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="organization">Организация</Label>
                        <Input
                            id="organization"
                            placeholder="ООО «Ромашка»"
                            {...register('organization')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="productCode">Продукт</Label>
                            <Input
                                id="productCode"
                                {...register('productCode')}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="ttlDays">Срок действия, дней</Label>
                            <Input
                                id="ttlDays"
                                type="number"
                                min={1}
                                max={90}
                                {...register('ttlDays', {
                                    min: {
                                        value: 1,
                                        message: 'От 1 до 90 дней',
                                    },
                                    max: {
                                        value: 90,
                                        message: 'От 1 до 90 дней',
                                    },
                                })}
                            />
                            {errors.ttlDays && (
                                <p className="text-sm text-red-600">
                                    {errors.ttlDays.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Checkbox
                            id="autoProvision"
                            checked={autoProvision}
                            onCheckedChange={(checked) =>
                                setAutoProvision(checked === true)
                            }
                        />
                        <div>
                            <Label htmlFor="autoProvision">
                                Ставить продукт сразу при погашении
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Снимите, если клиент должен сначала пройти
                                мастер настройки — тогда установку он запускает
                                кнопкой в кабинете.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="note">Заметка (клиент не видит)</Label>
                        <Input
                            id="note"
                            placeholder="Выдан по заявке с сайта"
                            {...register('note')}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">
                            {getErrorMessage(error)}
                        </p>
                    )}

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Выпускаем…' : 'Выпустить и отправить'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Отмена
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
