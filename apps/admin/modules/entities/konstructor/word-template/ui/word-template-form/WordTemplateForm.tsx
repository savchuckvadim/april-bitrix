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
import { OfferTemplateVisibility } from '@workspace/nest-konstructor-api';
import { FormFieldRenderer, type FormFieldConfig } from '@/modules/shared/ui';
import {
    CLIENT_TYPE_OPTIONS,
    EMPTY_CRITERIA_HELPER_TEXT,
    SUPPLY_TYPE_OPTIONS,
} from '@/modules/entities/konstructor/lib';
import { usePortals } from '@/modules/entities/portal';
import { ICreateWordTemplateDto, IUpdateWordTemplateDto } from '../../model';

/**
 * Критерии подбора: поставщик + типы клиента + виды размещения.
 *
 * Поля ХРАНЯТСЯ и редактируются, автоподбора шаблона КП по ним НЕТ
 * (зафиксированное решение: шаблоны КП не заходят в общий резолвер
 * шаблонов документов). Поэтому помечены как справочные.
 */
const CRITERIA_FIELDS: FormFieldConfig[] = [
    {
        name: 'agent_id',
        label: 'ID поставщика',
        type: 'text',
        placeholder: '42',
        helperText: 'Пусто — шаблон подходит любому поставщику.',
    },
    {
        name: 'client_types',
        label: 'Типы клиента',
        type: 'multiselect',
        options: CLIENT_TYPE_OPTIONS,
        helperText: EMPTY_CRITERIA_HELPER_TEXT,
    },
    {
        name: 'supply_types',
        label: 'Виды размещения',
        type: 'multiselect',
        options: SUPPLY_TYPE_OPTIONS,
        helperText: EMPTY_CRITERIA_HELPER_TEXT,
    },
];

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

/**
 * Видимость шаблона КП. Словарь бэкенда — public | private | user;
 * «private» и есть портальная область (привязка через offer_template_portal).
 */
const visibilityOptions = [
    { value: OfferTemplateVisibility.public, label: 'Публичный — виден всем порталам' },
    { value: OfferTemplateVisibility.private, label: 'Портальный — для выбранных порталов' },
    { value: OfferTemplateVisibility.user, label: 'Пользовательский — для одного сотрудника' },
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
            // Критерии подбора. Пустая строка и пустой список = «для любого»;
            // нормализация в DTO — в lib/utils/word-template-criteria-payload.
            agent_id: initialData?.agent_id ?? '',
            client_types: initialData?.client_types ?? [],
            supply_types: initialData?.supply_types ?? [],
            // Привязки к порталам (мультиселект в глобальном дереве).
            portal_ids: initialData?.portal_ids ?? [],
        },
    });

    const selectedFile = watch('file');
    const visibility = watch('visibility');

    // Мультиселект порталов нужен только в ГЛОБАЛЬНОМ дереве и только для
    // портальной видимости: внутри портала привязка задана самим маршрутом.
    const showPortalsPicker = !portalId && visibility === OfferTemplateVisibility.private;
    const portals = usePortals();
    const portalOptions = React.useMemo(
        () =>
            (portals.data ?? []).map((portal) => ({
                value: String(portal.id),
                label: portal.domain ? `${portal.domain} (#${portal.id})` : `Портал #${portal.id}`,
            })),
        [portals.data],
    );
    const portalsField: FormFieldConfig = {
        name: 'portal_ids',
        label: 'Порталы',
        type: 'multiselect',
        options: portalOptions,
        helperText:
            portals.isLoading
                ? 'Загружаем список порталов…'
                : 'Шаблон будет доступен на отмеченных порталах. Привязки синхронизируются: снятая галочка удаляет привязку.',
    };

    const onSubmitForm = (data: ICreateWordTemplateDto) => {
        const payload = {
            ...data,
            portal_id: portalId ? Number(portalId) : (data.portal_id ?? 0),
            user_id: userId ? Number(userId) : (data.user_id ?? 0),
            tags: data.tags ?? '',
            // Вне портальной видимости мультиселект смысла не имеет — не шлём,
            // иначе update трактовал бы [] как «снять все привязки».
            portal_ids: showPortalsPicker ? data.portal_ids : undefined,
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

                    {showPortalsPicker && (
                        <div className="space-y-2 rounded-md border p-4">
                            <FormFieldRenderer<ICreateWordTemplateDto>
                                fieldConfig={portalsField}
                                register={register}
                                control={control}
                                errors={errors}
                            />
                            {portals.isError && (
                                <p className="text-sm text-destructive">
                                    Не удалось загрузить список порталов.
                                </p>
                            )}
                        </div>
                    )}

                    {!portalId && !showPortalsPicker && (
                        <div className="space-y-2">
                            <Label htmlFor="portal_id">ID портала</Label>
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
                            <Label htmlFor="user_id">ID пользователя</Label>
                            <Input
                                id="user_id"
                                type="number"
                                {...register('user_id', {
                                    setValueAs: (value) => (value === '' ? undefined : Number(value)),
                                })}
                            />
                        </div>
                    )}

                    <div className="space-y-4 rounded-md border p-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Критерии подбора
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Поля сохраняются у шаблона справочно:
                                автоподбор шаблона КП по ним не выполняется.
                            </p>
                        </div>
                        {CRITERIA_FIELDS.map((fieldConfig) => (
                            <FormFieldRenderer<ICreateWordTemplateDto>
                                key={fieldConfig.name}
                                fieldConfig={fieldConfig}
                                register={register}
                                control={control}
                                errors={errors}
                            />
                        ))}
                    </div>

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
