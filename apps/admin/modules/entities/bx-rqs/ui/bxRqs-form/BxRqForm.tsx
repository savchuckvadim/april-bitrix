'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CreateBxRqDto, UpdateBxRqDto } from '@workspace/nest-api';
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

interface BxRqFormProps {
    initialData?: UpdateBxRqDto;
    onSubmit: (data: CreateBxRqDto | UpdateBxRqDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function BxRqForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: BxRqFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateBxRqDto | UpdateBxRqDto>({
        defaultValues: initialData || {},
    });

    const onSubmitForm = (data: CreateBxRqDto | UpdateBxRqDto) => {
        onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Создать bxrq' : 'Редактировать bxrq'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Заполните форму для создания нового bxrq'
                        : 'Измените данные bxrq'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    {/* TODO: Добавьте поля формы на основе CreateBxRqDto */}
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
