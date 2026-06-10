'use client';

import * as React from 'react';
import { useForm, UseFormRegister, Control, FieldErrors, DefaultValues } from 'react-hook-form';
import { ACard } from '@workspace/ui/shared';
import { FormFieldRenderer, FormFieldConfig } from '../form-field-renderer';
import { FormSubmitFooter } from '../form-submit-footer';
import { useServerErrorHandler } from '../../lib/error-handler/hooks/use-server-error-handler';
import { ServerError } from '../../lib/error-handler/types/server-error.types';

/**
 * Пропсы для EntityForm
 */
export interface EntityFormProps<T extends Record<string, any>, TEntity = any> {
    /** Начальные данные формы */
    initialData?: Partial<T>;
    /** Обработчик отправки формы */
    onSubmit: (data: T) => void;
    /** Обработчик отмены */
    onCancel?: () => void;
    /** Загрузка формы */
    isLoading?: boolean;
    /** Режим формы: create или edit */
    mode?: 'create' | 'edit';
    /** Ошибка от сервера */
    serverError?: ServerError;
    /** Конфигурация полей формы */
    fields: FormFieldConfig<TEntity>[];
    /** Заголовок карточки */
    title?: string;
    /** Описание карточки */
    description?: string;
    /** Функция для нормализации данных перед отправкой (например, для boolean полей) */
    normalizeData?: (data: T) => T;
    /** Сообщение об ошибке по умолчанию */
    defaultErrorMessage?: string;
}

/**
 * Универсальная форма для создания/редактирования сущностей
 * Принимает конфигурацию полей и автоматически рендерит форму
 */
export function EntityForm<T extends Record<string, any>, TEntity = any>({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
    serverError,
    fields,
    title,
    description,
    normalizeData,
    defaultErrorMessage,
}: EntityFormProps<T, TEntity>) {
    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors },
    } = useForm<T>({
        defaultValues: (initialData || {}) as DefaultValues<T>,
    });

    // Обработка ошибок сервера
    useServerErrorHandler(serverError, setError, defaultErrorMessage);

    const onSubmitForm = (data: T) => {
        // Применяем нормализацию данных, если она указана
        const formData = normalizeData ? normalizeData(data) : data;
        onSubmit(formData);
    };

    const onError = (errors: FieldErrors<T>) => {
        console.error('Form validation errors:', errors);
    };

    // Определяем описание по умолчанию, если не указано
    const formDescription = description ||
        (mode === 'create'
            ? 'Заполните форму для создания новой записи'
            : 'Измените данные записи');

    return (
        <form onSubmit={handleSubmit(onSubmitForm, onError)}>
            <ACard
                title={title}
                description={formDescription}
                footer={
                    <FormSubmitFooter onCancel={onCancel} isLoading={isLoading} mode={mode} />
                }
            >
                <div className="space-y-4">
                    {/* Отображение общей ошибки сервера */}
                    {errors.root && (
                        <div className="rounded-md bg-destructive/15 p-4 border border-destructive/50">
                            <p className="text-sm font-medium text-destructive">
                                {errors.root.message as string}
                            </p>
                        </div>
                    )}
                    {fields.map((fieldConfig) => (
                        <FormFieldRenderer
                            key={fieldConfig.name}
                            fieldConfig={{
                                ...fieldConfig,
                                name: fieldConfig.name as string,
                                required: fieldConfig.required ?? false,
                            }}
                            register={register as UseFormRegister<any>}
                            control={control as Control<any>}
                            errors={errors as FieldErrors<any>}
                        />
                    ))}
                </div>
            </ACard>
        </form>
    );
}
