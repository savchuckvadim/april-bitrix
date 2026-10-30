'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CreateSupplyDto } from '@workspace/nest-admin-api';
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
import { Textarea } from '@workspace/ui/components/textarea';

/**
 * Тексты договоров и КП — ШАБЛОНЫ по числу ОД (рендер на бэке,
 * libs/garant/src/supply/lib/supply-template.util.ts). Плейсхолдеры:
 * {n}, {words}, {words:gen}, {Words}, {plural:доступ|доступа|доступов}.
 */
const SUPPLY_TEXT_FIELDS: Array<{ name: keyof CreateSupplyDto; label: string }> = [
    { name: 'quantityForKp', label: 'Предложение: строка количества' },
    {
        name: 'contractPropSuppliesQuantity',
        label: 'Договор: количество поставок',
    },
    { name: 'contractName', label: 'Договор услуг: название поставки' },
    { name: 'contractProp1', label: 'Договор услуг: носитель' },
    { name: 'contractProp2', label: 'Договор услуг: способ доставки' },
    {
        name: 'contractPropLoginsQuantity',
        label: 'Договор услуг: количество логинов',
    },
    { name: 'contractPropComment', label: 'Договор услуг: примечание' },
    {
        name: 'contractPropEmail',
        label: 'Договор услуг: про адрес электронной почты',
    },
    { name: 'lcontractName', label: 'Лицензионный: название поставки' },
    { name: 'lcontractProp2', label: 'Лицензионный: способ доставки' },
    { name: 'lcontractPropComment', label: 'Лицензионный: примечание' },
    {
        name: 'lcontractPropEmail',
        label: 'Лицензионный: про адрес электронной почты',
    },
    { name: 'acontractName', label: 'Отчёт о поставке: название' },
    { name: 'acontractPropComment', label: 'Отчёт о поставке: примечание' },
];

interface SuppliesFormProps {
    initialData?: CreateSupplyDto;
    onSubmit: (data: CreateSupplyDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function SuppliesForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: SuppliesFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateSupplyDto>({
        defaultValues: initialData || {},
    });

    const onSubmitForm = (data: CreateSupplyDto) => {
        onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create'
                        ? 'Новый вид поставки'
                        : 'Изменить вид поставки'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Заполните поля нового вида поставки'
                        : 'Измените поля вида поставки'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Название поставки</Label>
                        <Input
                            id="name"
                            {...register('name', { required: 'Название обязательно' })}
                        />
                        {errors.name && (
                            <span className="text-sm text-destructive">{errors.name.message}</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Полное название</Label>
                        <Input
                            id="fullName"
                            {...register('fullName', { required: 'Полное название обязательно' })}
                        />
                        {errors.fullName && (
                            <span className="text-sm text-destructive">{errors.fullName.message}</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shortName">Короткое название</Label>
                        <Input
                            id="shortName"
                            {...register('shortName', { required: 'Короткое название обязательно' })}
                        />
                        {errors.shortName && (
                            <span className="text-sm text-destructive">{errors.shortName.message}</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">Код поставки</Label>
                        <Input
                            id="code"
                            {...register('code', { required: 'Код обязателен' })}
                        />
                        {errors.code && (
                            <span className="text-sm text-destructive">{errors.code.message}</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Тип поставки</Label>
                        <Input
                            id="type"
                            {...register('type', { required: 'Тип обязателен' })}
                        />
                        {errors.type && (
                            <span className="text-sm text-destructive">{errors.type.message}</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="usersQuantity">
                            Одновременных доступов
                        </Label>
                        <Input
                            id="usersQuantity"
                            type="number"
                            {...register('usersQuantity', {
                                required:
                                    'Укажите число одновременных доступов',
                                valueAsNumber: true,
                            })}
                        />
                        {errors.usersQuantity && (
                            <span className="text-sm text-destructive">{errors.usersQuantity.message}</span>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="coefficient">Коэффициент</Label>
                        <Input
                            id="coefficient"
                            type="number"
                            step="0.01"
                            {...register('coefficient', {
                                required: 'Коэффициент обязателен',
                                valueAsNumber: true,
                            })}
                        />
                        {errors.coefficient && (
                            <span className="text-sm text-destructive">{errors.coefficient.message}</span>
                        )}
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                        <p className="text-sm font-medium">
                            Тексты договоров и предложений
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Число доступов подставится само: {'{n}'} — цифрой,{' '}
                            {'{words}'} — прописью, {'{words:gen}'} — в
                            родительном падеже,{' '}
                            {'{plural:доступ|доступа|доступов}'} — нужная форма
                            слова. Пустое поле значит, что текст у поставки не
                            задан.
                        </p>
                    </div>
                    {SUPPLY_TEXT_FIELDS.map(field => (
                        <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>{field.label}</Label>
                            <Textarea id={field.name} rows={2} {...register(field.name)} />
                        </div>
                    ))}
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
