'use client';

import { CreateSmartDto, UpdateSmartDto } from '@workspace/nest-api';
import { ACard } from '@workspace/ui/shared';
import { FormFieldRenderer, FormSubmitFooter } from '@/modules/shared/ui';
import { useSmartForm } from '../../lib/hooks';

interface SmartFormProps {
    portalId?: number;
    initialData?: UpdateSmartDto;
    onSubmit: (data: CreateSmartDto | UpdateSmartDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function SmartForm({
    portalId,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: SmartFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        resolvedPortalId,
        fields,
    } = useSmartForm({ portalId, initialData });

    const onSubmitForm = (data: CreateSmartDto) => {
        const portalValue = resolvedPortalId ?? Number(data.portal_id);
        onSubmit({
            ...data,
            portal_id: portalValue,
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)}>
            <ACard
                footer={<FormSubmitFooter onCancel={onCancel} isLoading={isLoading} mode={mode} />}
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
