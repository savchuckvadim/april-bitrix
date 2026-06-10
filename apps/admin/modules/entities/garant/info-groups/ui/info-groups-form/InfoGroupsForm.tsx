'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { InfogroupCreateDto } from '../../model';
import { ACard } from '@workspace/ui/shared';
import { infogroupFormFields } from '../../lib/utils/infogroup-form-fields';
import { FormSubmitFooter, FormFieldRenderer } from '@/modules/shared/ui';

interface InfoGroupsFormProps {
    initialData?: InfogroupCreateDto;
    onSubmit: (data: InfogroupCreateDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function InfoGroupsForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: InfoGroupsFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<InfogroupCreateDto>({
        defaultValues: initialData || {},
    });

    const onSubmitForm = (data: InfogroupCreateDto) => {
        onSubmit(data);
    };

    const fields = infogroupFormFields;

    return (
        <form onSubmit={handleSubmit(onSubmitForm)}>
            <ACard
                description={mode === 'create' ? 'Заполните форму для создания новой группы инфоблоков' : 'Измените данные группы инфоблоков'}
                footer={
                    <FormSubmitFooter onCancel={onCancel} isLoading={isLoading} mode={mode} />
                }
            >
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
