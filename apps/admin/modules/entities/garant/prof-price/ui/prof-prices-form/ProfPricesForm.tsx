'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CreatePriceDto, CreatePriceDtoComplectCode, SupplyType, SupplyTypeCode } from '@workspace/nest-api';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { useComplects } from '@/modules/entities/garant/complect';
import { useSupplies } from '@/modules/entities/garant/supplies';
import { usePackages } from '@/modules/entities/garant/package';

interface ProfPricesFormProps {
    initialData?: CreatePriceDto;
    onSubmit: (data: CreatePriceDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

const regionTypeOptions = [
    { value: '0', label: 'Регионы' },
    { value: '1', label: 'Москва' },
] as const;

export function ProfPricesForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: ProfPricesFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreatePriceDto>({
        defaultValues: initialData || {},
    });

    // Загружаем данные для селектов
    const { data: complects } = useComplects();
    const { data: supplies } = useSupplies();
    const { data: packages } = usePackages();

    // Фильтруем complects по productType === 'garant' (prof)
    const complectCodeOptions = React.useMemo(() => {
        return (complects || [])
            .filter((c) => c.productType === 'garant')
            .map((c) => ({
                value: c.code as CreatePriceDtoComplectCode,
                label: c.name || c.shortName || c.code,
            }))
            .filter((option): option is { value: CreatePriceDtoComplectCode; label: string } =>
                option.value !== undefined
            );
    }, [complects]);

    // Фильтруем packages по withABS === false
    const packageCodeOptions = React.useMemo(() => {
        return (packages || [])
            .filter((p) => p.withABS === false)
            .map((p) => ({
                value: p.code,
                label: p.name || p.shortName || p.code,
            }));
    }, [packages]);

    // Получаем уникальные supply codes и types из supplies
    const supplyCodeOptions = React.useMemo(() => {
        return (supplies || []).map((s) => ({
            value: s.code,
            label: s.fullName || s.name || s.shortName || s.code,
        }));
    }, [supplies]);

    const supplyTypeCodeOptions: Array<{ value: SupplyTypeCode; label: string }> = [
        { value: '0', label: 'Internet' },
        { value: '1', label: 'Proxima' },
    ];

    const supplyTypeOptions: Array<{ value: SupplyType; label: string }> = [
        { value: 'internet', label: 'Internet' },
        { value: 'proxima', label: 'Proxima' },
    ];

    const onSubmitForm = (data: CreatePriceDto) => {
        onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Создать prof price' : 'Редактировать prof price'}
                </CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Заполните форму для создания нового prof price'
                        : 'Измените данные prof price'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Код цены</Label>
                        <Input
                            id="code"
                            {...register('code', { required: 'Код цены обязателен' })}
                        />
                        {errors.code && (
                            <span className="text-sm text-destructive">{errors.code.message}</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="region_type">Тип региона</Label>
                        <Controller
                            name="region_type"
                            control={control}
                            rules={{ required: 'Тип региона обязателен' }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="region_type">
                                        <SelectValue placeholder="Выберите тип региона" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regionTypeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.region_type && (
                            <span className="text-sm text-destructive">{errors.region_type.message}</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="value">Значение цены</Label>
                        <Input
                            id="value"
                            type="number"
                            step="0.01"
                            {...register('value', {
                                required: 'Значение цены обязательно',
                                valueAsNumber: true,
                            })}
                        />
                        {errors.value && (
                            <span className="text-sm text-destructive">{errors.value.message}</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="isSpecial"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="isSpecial"
                                        checked={field.value || false}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="isSpecial">Специальная цена</Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="discount">Скидка</Label>
                        <Input
                            id="discount"
                            type="number"
                            step="0.01"
                            {...register('discount', {
                                valueAsNumber: true,
                            })}
                        />
                        {errors.discount?.message && (
                            <span className="text-sm text-destructive">{String(errors.discount.message)}</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="complectCode">Код комплекта</Label>
                        <Controller
                            name="complectCode"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                    <SelectTrigger id="complectCode">
                                        <SelectValue placeholder="Выберите код комплекта" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Не выбрано</SelectItem>
                                        {complectCodeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="garantPackageCode">Код пакета Гарант</Label>
                        <Controller
                            name="garantPackageCode"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                    <SelectTrigger id="garantPackageCode">
                                        <SelectValue placeholder="Выберите код пакета" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Не выбрано</SelectItem>
                                        {packageCodeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="supplyTypeCode">Код типа поставки</Label>
                        <Controller
                            name="supplyTypeCode"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                    <SelectTrigger id="supplyTypeCode">
                                        <SelectValue placeholder="Выберите код типа поставки" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Не выбрано</SelectItem>
                                        {supplyTypeCodeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="supplyCode">Код поставки</Label>
                        <Controller
                            name="supplyCode"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                    <SelectTrigger id="supplyCode">
                                        <SelectValue placeholder="Выберите код поставки" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Не выбрано</SelectItem>
                                        {supplyCodeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="supplyType">Тип поставки</Label>
                        <Controller
                            name="supplyType"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                    <SelectTrigger id="supplyType">
                                        <SelectValue placeholder="Выберите тип поставки" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Не выбрано</SelectItem>
                                        {supplyTypeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
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
