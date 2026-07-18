'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CreatePortalDto, UpdatePortalDto } from '@workspace/nest-admin-api';
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

interface PortalFormProps {
    initialData?: UpdatePortalDto;
    onSubmit: (data: CreatePortalDto | UpdatePortalDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function PortalForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: PortalFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreatePortalDto | UpdatePortalDto>({
        defaultValues: initialData || {},
    });

    const onSubmitForm = (data: CreatePortalDto | UpdatePortalDto) => {
        onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Создать portal' : 'Редактировать portal'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Заполните форму для создания нового portal'
                        : 'Измените данные portal'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    {/* TODO: Добавьте поля формы на основе CreatePortalDto */}
                    <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                            id="domain"
                            type="text"
                            {...register('domain')}

                        // disabled={mode === 'edit'}
                        />
                    </div>

                    {/* TODO: Добавьте поля формы на основе CreatePortalDto */}
                    <div className="space-y-2">
                        <Label htmlFor="C_REST_CLIENT_ID">C_REST_CLIENT_ID</Label>
                        <Input
                            id="C_REST_CLIENT_ID"
                            type="text"
                            {...register('C_REST_CLIENT_ID')}

                        // disabled={mode === 'edit'}
                        />
                    </div>

                    {/* TODO: Добавьте поля формы на основе CreatePortalDto */}
                    <div className="space-y-2">
                        <Label htmlFor="C_REST_CLIENT_SECRET">C_REST_CLIENT_SECRET</Label>
                        <Input
                            id="C_REST_CLIENT_SECRET"
                            type="text"
                            {...register('C_REST_CLIENT_SECRET')}

                        // disabled={mode === 'edit'}
                        />
                    </div>

                    {/* TODO: Добавьте поля формы на основе CreatePortalDto */}
                    <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                            id="C_REST_WEB_HOOK_URL"
                            type="text"
                            {...register('C_REST_WEB_HOOK_URL')}

                        // disabled={mode === 'edit'}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2 justify-end mt-4">
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
                        {isLoading
                            ? 'Сохранение...'
                            : mode === 'create'
                                ? 'Создать'
                                : 'Сохранить'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
