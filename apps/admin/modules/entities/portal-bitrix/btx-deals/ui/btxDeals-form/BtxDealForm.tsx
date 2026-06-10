'use client';

import { CreateBtxDealDto, UpdateBtxDealDto } from '@workspace/nest-api';
import { ACard } from '@workspace/ui/shared';
import { FormFieldRenderer, FormSubmitFooter } from '@/modules/shared/ui';
import { useBtxDealForm } from '../../lib/hooks';

interface BtxDealFormProps {
    portalId?: number;
    initialData?: UpdateBtxDealDto;
    onSubmit: (data: CreateBtxDealDto | UpdateBtxDealDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function BtxDealForm({
    portalId,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
}: BtxDealFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        resolvedPortalId,
        fields,
    } = useBtxDealForm({ portalId, initialData });

    const onSubmitForm = (data: CreateBtxDealDto) => {
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
