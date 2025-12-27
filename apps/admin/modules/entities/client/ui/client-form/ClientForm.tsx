'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CreateClientDto, UpdateClientDto } from '@workspace/nest-api';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';

interface ClientFormProps {
    initialData?: UpdateClientDto;
    onSubmit: (data: CreateClientDto | UpdateClientDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function ClientForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: ClientFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<CreateClientDto | UpdateClientDto>({
        defaultValues: initialData || {
            name: '',
            email: '',
            status: 'active',
            is_active: true,
        },
    });

    const isActive = watch('is_active');

    const onSubmitForm = (data: CreateClientDto | UpdateClientDto) => {
        onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Создать клиента' : 'Редактировать клиента'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Заполните форму для создания нового клиента'
                        : 'Измените данные клиента'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Имя <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register('name', {
                                required: 'Имя обязательно для заполнения',
                            })}
                            placeholder="Введите имя клиента"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="email@example.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Статус</Label>
                        <Select
                            value={watch('status') || 'active'}
                            onValueChange={(value) =>
                                setValue('status', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Активен</SelectItem>
                                <SelectItem value="inactive">
                                    Неактивен
                                </SelectItem>
                                <SelectItem value="pending">Ожидает</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_active"
                            checked={isActive}
                            onCheckedChange={(checked) =>
                                setValue('is_active', !!checked)
                            }
                        />
                        <Label
                            htmlFor="is_active"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Клиент активен
                        </Label>
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

