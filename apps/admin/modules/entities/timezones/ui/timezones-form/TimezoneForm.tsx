'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CreateTimezoneDto, UpdateTimezoneDto } from '@workspace/nest-api';
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

interface TimezoneFormProps {
    initialData?: UpdateTimezoneDto;
    onSubmit: (data: CreateTimezoneDto | UpdateTimezoneDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function TimezoneForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: TimezoneFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateTimezoneDto | UpdateTimezoneDto>({
        defaultValues: initialData || {},
    });

    const onSubmitForm = (data: CreateTimezoneDto | UpdateTimezoneDto) => {
        onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Создать timezone' : 'Редактировать timezone'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Заполните форму для создания нового timezone'
                        : 'Измените данные timezone'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    {/* TODO: Добавьте поля формы на основе CreateTimezoneDto */}
                    <div className="space-y-2">
                        <Label htmlFor="id">ID</Label>
                        <Input
                            id="id"
                            type="number"
                            {...register('id' as any)}
                            disabled={mode === 'edit'}
                        />
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
