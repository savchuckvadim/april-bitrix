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
    usePortalOptions,
    useProviderOptions,
} from '@/modules/entities/konstructor/lib';
import { useDepartmentUsers } from '../../lib/hooks';
import { formatDepartmentUser } from '../../lib/utils/word-template-user-selection';
import { ICreateWordTemplateDto, IUpdateWordTemplateDto } from '../../model';

/**
 * Критерии подбора: типы клиента + виды размещения. Поставщик — отдельным
 * селектом ниже (зависит от портала).
 *
 * Поля ХРАНЯТСЯ и редактируются, автоподбора шаблона КП по ним НЕТ
 * (зафиксированное решение: шаблоны КП не заходят в общий резолвер
 * шаблонов документов). Поэтому помечены как справочные.
 */
const CRITERIA_FIELDS: FormFieldConfig[] = [
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
            // В портальном дереве по умолчанию портальный шаблон: он создаётся
            // для этого портала, а не публичный на всех.
            visibility:
                initialData?.visibility ??
                (portalId ? OfferTemplateVisibility.private : OfferTemplateVisibility.public),
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
    const portalIds = watch('portal_ids');
    const singlePortalId = watch('portal_id');

    const isPortalVisibility = visibility === OfferTemplateVisibility.private;
    const isUserVisibility = visibility === OfferTemplateVisibility.user;

    // Мультиселект порталов нужен только в ГЛОБАЛЬНОМ дереве и только для
    // портальной видимости: внутри портала привязка задана самим маршрутом.
    const showPortalsPicker = !portalId && isPortalVisibility;
    // Пользовательский шаблон в глобальном дереве: сначала ОДИН портал,
    // затем сотрудник его отдела продаж.
    const showSinglePortalPicker = !portalId && isUserVisibility;

    const portals = usePortalOptions();

    /**
     * Портал, по которому ищем поставщиков и сотрудников:
     * портальное дерево → из маршрута; портальная видимость → первый из
     * мультиселекта; пользовательская → выбранный один портал.
     */
    const effectivePortalId = portalId
        ? String(portalId)
        : isPortalVisibility
          ? portalIds?.[0]
          : singlePortalId
            ? String(singlePortalId)
            : undefined;

    const providers = useProviderOptions(effectivePortalId);
    const users = useDepartmentUsers(providers.domain);

    const portalsField: FormFieldConfig = {
        name: 'portal_ids',
        label: 'Порталы',
        type: 'multiselect',
        options: portals.options,
        helperText: portals.isLoading
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

                    {showSinglePortalPicker && (
                        <div className="space-y-2">
                            <Label htmlFor="portal_id">Портал</Label>
                            <Controller
                                name="portal_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? String(field.value) : ''}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                    >
                                        <SelectTrigger id="portal_id">
                                            <SelectValue
                                                placeholder={portals.isLoading ? 'Загружаем порталы…' : 'Выберите портал'}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {portals.options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <p className="text-xs text-muted-foreground">
                                Пользовательский шаблон принадлежит сотруднику конкретного портала.
                            </p>
                        </div>
                    )}

                    {isUserVisibility && !userId && (
                        <div className="space-y-2">
                            <Label htmlFor="user_id">Сотрудник</Label>
                            <Controller
                                name="user_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? String(field.value) : ''}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        disabled={!providers.domain}
                                    >
                                        <SelectTrigger id="user_id">
                                            <SelectValue
                                                placeholder={
                                                    !effectivePortalId
                                                        ? 'Сначала выберите портал'
                                                        : users.isLoading
                                                          ? 'Загружаем отдел продаж…'
                                                          : 'Выберите сотрудника'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(users.data ?? []).map((user) => (
                                                <SelectItem key={user.ID} value={String(user.ID)}>
                                                    {formatDepartmentUser(user)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <p className="text-xs text-muted-foreground">
                                Сотрудники отдела продаж портала из Bitrix.
                            </p>
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

                        <div className="space-y-2">
                            <Label htmlFor="agent_id">Поставщик</Label>
                            <Controller
                                name="agent_id"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? String(field.value) : ''}
                                        onValueChange={field.onChange}
                                        disabled={!providers.hasPortal}
                                    >
                                        <SelectTrigger id="agent_id">
                                            <SelectValue
                                                placeholder={
                                                    !providers.hasPortal
                                                        ? 'Любой поставщик (сначала выберите портал)'
                                                        : providers.isLoading
                                                          ? 'Загружаем поставщиков…'
                                                          : 'Любой поставщик'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providers.options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">
                                    Пусто — шаблон подходит любому поставщику.
                                </p>
                                {watch('agent_id') && (
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs"
                                        onClick={() => setValue('agent_id', '')}
                                    >
                                        Сбросить
                                    </Button>
                                )}
                            </div>
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
