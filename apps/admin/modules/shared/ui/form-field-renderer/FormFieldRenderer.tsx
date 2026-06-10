'use client';

import * as React from 'react';
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Field } from '@workspace/ui/shared';
import { EntitySelect, EntityType } from '../entity-select';

// Generic тип для фильтров entity-select (может работать с любыми типами сущностей)
type EntityFilterFn<TEntity = any> = (entity: TEntity) => boolean;

export interface FormFieldConfig<TEntity = any> {
    name: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'email' | 'password' | 'date' | 'entity-select';
    required?: boolean;
    placeholder?: string;
    helperText?: string;
    options?: { value: string; label: string }[];
    disabled?: boolean;
    entityType?: EntityType; // Для типа 'entity-select'
    isMultiple?: boolean; // Для типа 'entity-select'
    filterFn?: EntityFilterFn<TEntity>; // Для типа 'entity-select' - функция фильтрации (generic)
}

interface FormFieldRendererProps<T extends Record<string, any>, TEntity = any> {
    fieldConfig: FormFieldConfig<TEntity>;
    register: UseFormRegister<T>;
    control: Control<T>;
    errors: FieldErrors<T>;
}

/**
 * Универсальный компонент для рендеринга полей формы разных типов
 *
 * @template T - Тип данных формы
 * @template TEntity - Тип сущности для entity-select (опционально)
 */
export function FormFieldRenderer<T extends Record<string, any>, TEntity = any>({
    fieldConfig,
    register,
    control,
    errors,
}: FormFieldRendererProps<T, TEntity>) {
    const fieldName = fieldConfig.name as keyof T;
    const fieldError = errors[fieldName];

    const renderField = () => {
        switch (fieldConfig.type) {
            case 'text':
            case 'email':
            case 'password':
                return (
                    <Input
                        id={fieldConfig.name}
                        type={fieldConfig.type}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                        {...register(fieldName as any, {
                            required: fieldConfig.required,
                        })}
                    />
                );

            case 'number':
                return (
                    <Input
                        id={fieldConfig.name}
                        type="number"
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                        {...register(fieldName as any, {
                            required: fieldConfig.required,
                            valueAsNumber: true,
                        })}
                    />
                );

            case 'date':
                return (
                    <Input
                        id={fieldConfig.name}
                        type="date"
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                        {...register(fieldName as any, {
                            required: fieldConfig.required,
                        })}
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        id={fieldConfig.name}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                        className="min-h-[100px]"
                        {...register(fieldName as any, {
                            required: fieldConfig.required,
                        })}
                    />
                );

            case 'boolean':
                return (
                    <div className="flex items-center gap-2">
                        <Controller
                            name={fieldName as any}
                            control={control}
                            rules={{
                                // Для boolean полей required означает, что значение должно быть явно установлено (не undefined/null)
                                validate: (value) => {
                                    if (fieldConfig.required && (value === undefined || value === null)) {
                                        return `${fieldConfig.label} является обязательным полем`;
                                    }
                                    return true;
                                },
                            }}
                            render={({ field }) => (
                                <Checkbox
                                    id={fieldConfig.name}
                                    checked={field.value ?? false}
                                    onCheckedChange={(checked) => {
                                        // Гарантируем, что всегда передается boolean, а не undefined
                                        // checked может быть true, false или "indeterminate"
                                        field.onChange(checked === true);
                                    }}
                                    disabled={fieldConfig.disabled}
                                />
                            )}
                        />
                        <Label htmlFor={fieldConfig.name} className="cursor-pointer">
                            {fieldConfig.label}
                        </Label>
                    </div>
                );

            case 'select':
                return (
                    <Controller
                        name={fieldName as any}
                        control={control}
                        rules={{ required: fieldConfig.required }}
                        render={({ field }) => (
                            <Select
                                value={field.value?.toString() || ''}
                                onValueChange={field.onChange}
                                disabled={fieldConfig.disabled}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={fieldConfig.placeholder || `Выберите ${fieldConfig.label.toLowerCase()}`}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {fieldConfig.options?.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                );

            case 'multiselect':
                return (
                    <Controller
                        name={fieldName as any}
                        control={control}
                        rules={{ required: fieldConfig.required }}
                        render={({ field }) => {
                            // Явно приводим к массиву строк для корректной работы TypeScript
                            const currentValue: string[] = Array.isArray(field.value)
                                ? (field.value as string[])
                                : [];

                            return (
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {fieldConfig.options?.map((option) => {
                                            const isSelected = currentValue.includes(option.value);
                                            return (
                                                <div key={option.value} className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([...currentValue, option.value]);
                                                            } else {
                                                                field.onChange(currentValue.filter((v) => v !== option.value));
                                                            }
                                                        }}
                                                        disabled={fieldConfig.disabled}
                                                    />
                                                    <Label className="cursor-pointer">{option.label}</Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {fieldConfig.helperText && (
                                        <p className="text-sm text-muted-foreground">{fieldConfig.helperText}</p>
                                    )}
                                </div>
                            );
                        }}
                    />
                );

            case 'entity-select':
                return (
                    <Controller
                        name={fieldName as any}
                        control={control}
                        rules={{ required: fieldConfig.required }}
                        render={({ field }) => (
                            <EntitySelect
                                entityType={fieldConfig.entityType || 'infoblock'}
                                value={field.value}
                                onChange={field.onChange}
                                isMultiple={fieldConfig.isMultiple || false}
                                placeholder={fieldConfig.placeholder}
                                disabled={fieldConfig.disabled}
                                required={fieldConfig.required}
                                showCode={true}
                                filterFn={fieldConfig.filterFn as any}
                            />
                        )}
                    />
                );

            default:
                return null;
        }
    };

    // Для boolean полей label уже отображается внутри поля
    if (fieldConfig.type === 'boolean') {
        // Формируем сообщение об ошибке для boolean полей
        const errorMessage = fieldError?.type === 'required'
            ? `${fieldConfig.label} является обязательным полем`
            : (fieldError?.message as string | undefined);

        return (
            <Field
                error={errorMessage}
                helperText={fieldConfig.helperText}
                required={fieldConfig.required}
            >
                {renderField()}
            </Field>
        );
    }

    // Формируем сообщение об ошибке
    const errorMessage = fieldError?.type === 'required'
        ? `${fieldConfig.label} является обязательным полем`
        : (fieldError?.message as string | undefined);

    return (
        <Field
            label={fieldConfig.label}
            error={errorMessage}
            helperText={fieldConfig.helperText}
            required={fieldConfig.required}
        >
            {renderField()}
        </Field>
    );
}
