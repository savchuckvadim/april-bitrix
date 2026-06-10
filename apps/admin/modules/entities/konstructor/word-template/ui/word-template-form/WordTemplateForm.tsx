'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { OfferTemplateVisibility } from '@workspace/nest-api';
import { ICreateWordTemplateDto, IUpdateWordTemplateDto } from '../../model';

type WordTemplateFormCreateProps = {
    initialData?: Partial<ICreateWordTemplateDto>;
    mode?: 'create';
    onSubmit?: (data: ICreateWordTemplateDto) => void;
    onCreate?: (data: ICreateWordTemplateDto) => void;
    onUpdate?: never;
    portalId?: string | number;
    userId?: string | number;
    onCancel?: () => void;
    isLoading?: boolean;
};

type WordTemplateFormEditProps = {
    initialData?: Partial<ICreateWordTemplateDto>;
    mode: 'edit';
    onSubmit?: (data: IUpdateWordTemplateDto) => void;
    onUpdate?: (data: IUpdateWordTemplateDto) => void;
    onCreate?: never;
    portalId?: string | number;
    userId?: string | number;
    onCancel?: () => void;
    isLoading?: boolean;
};

type WordTemplateFormProps = WordTemplateFormCreateProps | WordTemplateFormEditProps;

const visibilityOptions = [
    { value: OfferTemplateVisibility.public, label: 'Public' },
    // Backend visibility enum is public | private | user; "Portal" scope === private.
    { value: OfferTemplateVisibility.private, label: 'Portal' },
    { value: OfferTemplateVisibility.user, label: 'User' },
] as const;


export function WordTemplateForm({
    initialData,
    onSubmit,
    onCreate,
    onUpdate,

    onCancel,
    isLoading = false,
    mode = 'create',
    portalId,
    userId,
}: WordTemplateFormProps) {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ICreateWordTemplateDto>({
        defaultValues: {
            name: initialData?.name ?? '',
            visibility: initialData?.visibility ?? OfferTemplateVisibility.public,
            is_default: initialData?.is_default ?? false,
            tags: initialData?.tags ?? '',
            is_active: initialData?.is_active ?? true,
            portal_id: initialData?.portal_id ?? (portalId ? Number(portalId) : undefined),
            user_id: initialData?.user_id ?? (userId ? Number(userId) : undefined),
            file: initialData?.file,
        },
    });

    const selectedFile = watch('file');

    const onSubmitForm = (data: ICreateWordTemplateDto) => {
        const payload = {
            ...data,
            portal_id: portalId ? Number(portalId) : (data.portal_id ?? 0),
            user_id: userId ? Number(userId) : (data.user_id ?? 0),
            tags: data.tags ?? '',
        };

        if (mode === 'create') {
            onCreate?.(payload);
            (onSubmit as ((dto: ICreateWordTemplateDto) => void) | undefined)?.(payload);
            return;
        }

        onUpdate?.(payload);
        (onSubmit as ((dto: IUpdateWordTemplateDto) => void) | undefined)?.(payload);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create' ? 'Создать шаблон' : 'Редактировать шаблон'}
                </CardTitle>
                <CardDescription>
                    Загрузите DOCX и заполните параметры шаблона
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Название</Label>
                        <Input id="name" {...register('name', { required: 'Введите название' })} />
                        {errors.name && <span className="text-sm text-destructive">{errors.name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="visibility">Видимость</Label>
                        <Controller
                            name="visibility"
                            control={control}
                            rules={{ required: 'Выберите видимость' }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="visibility">
                                        <SelectValue placeholder="Выберите видимость" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {visibilityOptions.map((option) => (
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
                        <Label htmlFor="tags">Теги</Label>
                        <Input id="tags" {...register('tags')} placeholder="tag1, tag2" />
                    </div>

                    {!portalId && (
                        <div className="space-y-2">
                            <Label htmlFor="portal_id">Portal ID</Label>
                            <Input
                                id="portal_id"
                                type="number"
                                {...register('portal_id', {
                                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                                })}
                            />
                        </div>
                    )}

                    {!userId && (
                        <div className="space-y-2">
                            <Label htmlFor="user_id">User ID</Label>
                            <Input
                                id="user_id"
                                type="number"
                                {...register('user_id', {
                                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                                })}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="file">DOCX файл</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setValue('file', file);
                                }
                            }}
                        />
                        {selectedFile && (
                            <p className="text-xs text-muted-foreground">
                                Выбран файл: {(selectedFile as File).name || 'добавлен'}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <Controller
                                name="is_default"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="is_default"
                                        checked={field.value || false}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                    />
                                )}
                            />
                            <Label htmlFor="is_default">По умолчанию</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="is_active"
                                        checked={field.value || false}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                    />
                                )}
                            />
                            <Label htmlFor="is_active">Активен</Label>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Отмена
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
