'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { CreateComplectDto } from '@workspace/nest-api';

import { ACard } from '@workspace/ui/shared';
import { complectFormFields } from '../../lib/utils/complect-form-fields';
import { FormSubmitFooter, FormFieldRenderer } from '@/modules/shared/ui';

interface ComplectFormProps {
    initialData?: CreateComplectDto;
    onSubmit: (data: CreateComplectDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function ComplectForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: ComplectFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreateComplectDto>({
        defaultValues: initialData || {},
    });

    const onSubmitForm = (data: CreateComplectDto) => {
        onSubmit(data);
    };

    // Используем конфигурацию полей из схемы
    // Это позволяет автоматически генерировать поля на основе типа CreateComplectDto
    const fields = complectFormFields;

    return (

        <form onSubmit={handleSubmit(onSubmitForm)} >
            <ACard
                // title={mode === 'create' ? 'Создать complect' : 'Редактировать complect'}
                // description={mode === 'create' ? 'Заполните форму для создания нового complect' : 'Измените данные complect'}
                footer={
                    <FormSubmitFooter onCancel={onCancel} isLoading={isLoading} mode={mode} />
                }
            >
                {/* Автоматическая генерация полей на основе конфигурации */}
                <div className="space-y-4">
                    {fields.map((fieldConfig) => (
                        <FormFieldRenderer
                            key={fieldConfig.name}
                            fieldConfig={{
                                ...fieldConfig,
                                name: fieldConfig.name as string,
                                required: fieldConfig.required ?? false,
                            }}
                            register={register}
                            control={control}
                            errors={errors}
                        />
                    ))}
                </div>
            </ACard>
        </form>


    );
}
