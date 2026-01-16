'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CreateBitrixFieldDto, CreateBitrixFieldsBulkDto, UpdateBitrixFieldDto } from '@workspace/nest-api';
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

interface BitrixFieldFormProps {
    initialData?: UpdateBitrixFieldDto;
    onSubmit: (data: CreateBitrixFieldDto | UpdateBitrixFieldDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function BitrixFieldForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: BitrixFieldFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateBitrixFieldDto | UpdateBitrixFieldDto>({
        defaultValues: initialData || {},
    });

    const onSubmitForm = (data: CreateBitrixFieldDto | UpdateBitrixFieldDto) => {
        onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Создать bitrixfield' : 'Редактировать bitrixfield'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Заполните форму для создания нового bitrixfield'
                        : 'Измените данные bitrixfield'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    {/* TODO: Добавьте поля формы на основе CreateBitrixFieldsBulkDto */}
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
