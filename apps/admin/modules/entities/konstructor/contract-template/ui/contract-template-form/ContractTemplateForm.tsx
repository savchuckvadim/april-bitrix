'use client';

/**
 * Форма шаблона договора.
 *
 * Словарные поля рендерит ОБЩИЙ `FormFieldRenderer` (он уже умеет
 * `multiselect` — группу чекбоксов по `options`), поэтому второй
 * мультиселект здесь не изобретается. Подписи берутся из общего
 * канонического модуля `@/modules/entities/konstructor/lib` — своей копии у сущности
 * нет сознательно.
 *
 * Нормализация значений в тело запроса — в `lib/utils`, не здесь:
 * правило «пустой список = любой» и вывод portal_id/agent_id из `scope`
 * покрыты юнит-тестами, а компонент только собирает значения и показывает
 * ошибки.
 */
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Field } from '@workspace/ui/shared';
import { FormFieldRenderer, type FormFieldConfig } from '@/modules/shared/ui';
import {
    CLIENT_TYPE_OPTIONS,
    CONTRACT_LTYPE_OPTIONS,
    SUPPLY_TYPE_OPTIONS,
    TEMPLATE_SCOPE_OPTIONS,
} from '@/modules/entities/konstructor/lib';
import type { IContractTemplateFormValues } from '../../model';
import {
    emptyContractTemplateFormValues,
    scopeBindings,
    validateContractTemplateForm,
} from '../../lib/utils';

const DOCX_ACCEPT =
    '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

interface ContractTemplateFormProps {
    mode: 'create' | 'edit';
    initialValues?: IContractTemplateFormValues;
    /** Портальное дерево: портал подставлен и не редактируется. */
    portalId?: string;
    isLoading?: boolean;
    onSubmit: (values: IContractTemplateFormValues) => void;
    onCancel?: () => void;
}

export function ContractTemplateForm({
    mode,
    initialValues,
    portalId,
    isLoading = false,
    onSubmit,
    onCancel,
}: ContractTemplateFormProps) {
    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<IContractTemplateFormValues>({
        defaultValues: initialValues ?? emptyContractTemplateFormValues(portalId),
    });

    const values = watch();
    const { withPortal, withAgent } = scopeBindings(values.scope);

    // Доменные ошибки (связка scope ↔ portal_id/agent_id, обязательный тип
    // договора) считаются той же функцией, что и в тесте, — одна правда.
    const domainErrors = validateContractTemplateForm(values, { mode });
    const canSubmit = Object.keys(domainErrors).length === 0;

    const contractTypeField: FormFieldConfig = {
        name: 'contract_type',
        label: 'Тип договора',
        type: 'select',
        required: true,
        options: CONTRACT_LTYPE_OPTIONS,
        placeholder: 'Выберите тип договора',
        helperText:
            'Обязательное поле: шаблона договора «по умолчанию» не существует — ' +
            'каждый тип рендерится своим шаблоном.',
    };

    const scopeField: FormFieldConfig = {
        name: 'scope',
        label: 'Область применения',
        type: 'select',
        required: true,
        options: TEMPLATE_SCOPE_OPTIONS,
        helperText: '«Общий» — шаблон доступен всем порталам (portal_id не заполняется).',
    };

    const clientTypesField: FormFieldConfig = {
        name: 'client_types',
        label: 'Типы клиента',
        type: 'multiselect',
        options: CLIENT_TYPE_OPTIONS,
        helperText: 'Ничего не выбрано — шаблон подходит ЛЮБОМУ типу клиента.',
    };

    const supplyTypesField: FormFieldConfig = {
        name: 'supply_types',
        label: 'Типы поставки',
        type: 'multiselect',
        options: SUPPLY_TYPE_OPTIONS,
        helperText: 'Ничего не выбрано — шаблон подходит ЛЮБОМУ типу поставки.',
    };

    const descriptionField: FormFieldConfig = {
        name: 'description',
        label: 'Описание',
        type: 'textarea',
        placeholder: 'Например: редакция от 01.10.2026, согласована юристом',
    };

    const isDefaultField: FormFieldConfig = {
        name: 'is_default',
        label: 'Шаблон по умолчанию',
        type: 'boolean',
        helperText:
            'По умолчанию в своей области: портал + поставщик + тип договора. ' +
            'Флаг снимется у остальных шаблонов этой области того же типа.',
    };

    const isActiveField: FormFieldConfig = {
        name: 'is_active',
        label: 'Активен',
        type: 'boolean',
        helperText: 'Неактивные шаблоны не участвуют в подборе при генерации.',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create'
                        ? 'Создать шаблон договора'
                        : 'Редактировать шаблон договора'}
                </CardTitle>
                <CardDescription>
                    Загрузите DOCX-шаблон и укажите, для каких договоров он подходит.
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <Field
                        label="Название"
                        required
                        error={
                            errors.name?.message ??
                            (domainErrors.name as string | undefined)
                        }
                    >
                        <Input
                            id="name"
                            placeholder="Договор услуг (интернет), бюджетники"
                            {...register('name')}
                        />
                    </Field>

                    <FormFieldRenderer<IContractTemplateFormValues>
                        fieldConfig={contractTypeField}
                        register={register}
                        control={control}
                        errors={errors}
                    />
                    {/* Доменная ошибка показывается рядом с полем, а не только у кнопки. */}
                    {domainErrors.contract_type && (
                        <p className="text-sm text-destructive">
                            {domainErrors.contract_type}
                        </p>
                    )}

                    <FormFieldRenderer<IContractTemplateFormValues>
                        fieldConfig={scopeField}
                        register={register}
                        control={control}
                        errors={errors}
                    />

                    {withPortal && (
                        <Field
                            label="ID портала"
                            required
                            error={domainErrors.portal_id}
                            helperText={
                                portalId
                                    ? 'Портал подставлен из адреса страницы.'
                                    : 'ID портала (BIGINT, строка).'
                            }
                        >
                            <Input
                                id="portal_id"
                                inputMode="numeric"
                                // Не type="number": id — строка, BIGINT > 2^53
                                // потерял бы точность при приведении к number.
                                disabled={Boolean(portalId)}
                                {...register('portal_id')}
                            />
                        </Field>
                    )}

                    {withAgent && (
                        <Field
                            label="ID поставщика"
                            required
                            error={domainErrors.agent_id}
                            helperText="ID из agents. Нужен только для области «под поставщика»."
                        >
                            <Input id="agent_id" inputMode="numeric" {...register('agent_id')} />
                        </Field>
                    )}

                    <FormFieldRenderer<IContractTemplateFormValues>
                        fieldConfig={clientTypesField}
                        register={register}
                        control={control}
                        errors={errors}
                    />

                    <FormFieldRenderer<IContractTemplateFormValues>
                        fieldConfig={supplyTypesField}
                        register={register}
                        control={control}
                        errors={errors}
                    />

                    <FormFieldRenderer<IContractTemplateFormValues>
                        fieldConfig={descriptionField}
                        register={register}
                        control={control}
                        errors={errors}
                    />

                    <Field
                        label="Файл шаблона (.docx)"
                        required={mode === 'create'}
                        error={domainErrors.file}
                        helperText={
                            mode === 'edit'
                                ? 'Без нового файла прежний останется на месте.'
                                : 'DOCX с тегами docxtemplater.'
                        }
                    >
                        <Input
                            id="file"
                            type="file"
                            accept={DOCX_ACCEPT}
                            onChange={event =>
                                setValue('file', event.target.files?.[0] ?? null, {
                                    shouldValidate: true,
                                })
                            }
                        />
                    </Field>

                    <Field
                        label="Демонстрационный файл (необязательно)"
                        helperText="Заполненный пример — отдаётся по ссылке скачивания с ?demo=1."
                    >
                        <Input
                            id="demo"
                            type="file"
                            accept={DOCX_ACCEPT}
                            onChange={event =>
                                setValue('demo', event.target.files?.[0] ?? null)
                            }
                        />
                    </Field>

                    <div className="flex flex-wrap gap-6">
                        <FormFieldRenderer<IContractTemplateFormValues>
                            fieldConfig={isDefaultField}
                            register={register}
                            control={control}
                            errors={errors}
                        />
                        <FormFieldRenderer<IContractTemplateFormValues>
                            fieldConfig={isActiveField}
                            register={register}
                            control={control}
                            errors={errors}
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex items-center justify-end gap-2">
                    {!canSubmit && (
                        <span className="mr-auto text-sm text-muted-foreground">
                            Заполните обязательные поля, помеченные звёздочкой.
                        </span>
                    )}
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
                    {/* Submit заблокирован, пока не выбран тип договора. */}
                    <Button type="submit" disabled={isLoading || !canSubmit}>
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

/** Реэкспорт для читаемости вызовов в страницах. */
export const CONTRACT_TEMPLATE_DEFAULT_SCOPE = 'common';
