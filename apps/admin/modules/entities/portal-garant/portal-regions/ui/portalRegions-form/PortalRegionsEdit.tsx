'use client';

import { usePortalRegionEdit } from '../../lib/hooks/use-portalRegion-edit';
import { PortalRegionsForm } from './PortalRegionsForm';

export function PortalRegionsEdit() {
    const {
        initialData,
        sourceOptions,
        submit,
        cancel,
        isSaving,
        isSaved,
        error,
    } = usePortalRegionEdit();

    return (
        <div className="space-y-2">
            {error && (
                <p className="text-destructive text-sm">
                    Не удалось сохранить: {error.message}
                </p>
            )}
            {isSaved && <p className="text-sm">Сохранено</p>}

            <PortalRegionsForm
                initialData={initialData}
                sourceOptions={sourceOptions}
                onSubmit={submit}
                onCancel={cancel}
                isLoading={isSaving}
            />
        </div>
    );
}
