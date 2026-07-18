'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { AppSecretDto, UpsertAppSecretDto } from '@workspace/nest-admin-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Eye, EyeOff } from 'lucide-react';

export interface SecretFormValues extends UpsertAppSecretDto {
    code: string;
}

interface SecretFormProps {
    mode: 'create' | 'edit';
    initialData?: AppSecretDto;
    onSubmit: (values: SecretFormValues) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

/** Форма создания/редактирования OAuth-кред приложения. */
export function SecretForm({
    mode,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: SecretFormProps) {
    const [showSecret, setShowSecret] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SecretFormValues>({
        defaultValues: {
            code: initialData?.code ?? '',
            clientId: initialData?.clientId ?? '',
            clientSecret: '',
            group: initialData?.group ?? '',
            type: initialData?.type ?? '',
        },
    });

    const onSubmitForm = (values: SecretFormValues) => {
        onSubmit({
            ...values,
            group: values.group || undefined,
            type: values.type || undefined,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create'
                        ? 'Добавить креды приложения'
                        : `Изменить креды «${initialData?.code ?? ''}»`}
                </CardTitle>
                <CardDescription>
                    Код приложения «Менеджер Гарант» — garant_manager; значения
                    client_id/client_secret — из кабинета вендора Битрикс24.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Код приложения</Label>
                        <Input
                            id="code"
                            placeholder="garant_manager"
                            readOnly={mode === 'edit'}
                            className={mode === 'edit' ? 'bg-muted' : undefined}
                            {...register('code', {
                                required: 'Укажите код приложения',
                            })}
                        />
                        {errors.code && (
                            <p className="text-sm text-destructive">
                                {errors.code.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clientId">client_id</Label>
                        <Input
                            id="clientId"
                            placeholder="app.xxxxxxxx.yyyyyyyy"
                            {...register('clientId', {
                                required: 'Укажите client_id',
                            })}
                        />
                        {errors.clientId && (
                            <p className="text-sm text-destructive">
                                {errors.clientId.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clientSecret">client_secret</Label>
                        <div className="flex gap-2">
                            <Input
                                id="clientSecret"
                                type={showSecret ? 'text' : 'password'}
                                autoComplete="new-password"
                                {...register('clientSecret', {
                                    required: 'Укажите client_secret',
                                })}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setShowSecret((v) => !v)}
                                title={showSecret ? 'Скрыть' : 'Показать'}
                            >
                                {showSecret ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        {mode === 'edit' && (
                            <p className="text-sm text-muted-foreground">
                                Введите новый секрет — старый показать нельзя.
                            </p>
                        )}
                        {errors.clientSecret && (
                            <p className="text-sm text-destructive">
                                {errors.clientSecret.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="group">Группа</Label>
                        <Input id="group" {...register('group')} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Тип</Label>
                        <Input id="type" {...register('type')} />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2 justify-end">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Отмена
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
