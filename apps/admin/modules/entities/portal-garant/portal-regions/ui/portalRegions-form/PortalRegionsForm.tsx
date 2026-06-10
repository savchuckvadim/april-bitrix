'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { UpdatePortalRegionDto } from '../../model';

interface PortalRegionsFormProps {
    initialData?: UpdatePortalRegionDto;
    onSubmit: (data: UpdatePortalRegionDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'edit';
}

export function PortalRegionsForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'edit',
}: PortalRegionsFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UpdatePortalRegionDto>({
        defaultValues: initialData || {},
    });

    const onSubmitForm = (data: UpdatePortalRegionDto) => {
        onSubmit(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Редактировать регион
                </CardTitle>
                <CardDescription>
                    Измените данные региона
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    {/* TODO: Добавьте поля формы на основе CreatePortalMeasureDto */}
                    <div className="space-y-2">
                        <Label htmlFor="own_abs">Own ABS</Label>
                        <Input
                            id="id"
                            type="number"
                            {...register('own_abs')}
                            required
                            min={1}

                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="own_tax">Own Tax</Label>
                        <Input
                            id="id"
                            type="number"
                            {...register('own_tax')}

                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="own_tax_abs">Own Tax ABS</Label>
                        <Input
                            id="id"
                            type="number"
                            {...register('own_tax_abs')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="own_abs">regionCode</Label>
                        <Input
                            id="id"
                            type="text"
                            {...register('regionCode')}
                            disabled={true}

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
                            : 'Сохранить'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
