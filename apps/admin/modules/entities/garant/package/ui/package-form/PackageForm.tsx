'use client';

import { IGarantPackageCreate } from '../../model';
import { packageFormFields } from '../../lib/utils/package-form-fields';
import { EntityForm } from '@/modules/shared/ui';
import { ServerError } from '@/modules/shared/lib/error-handler/types/server-error.types';
import { InfoblockListItem } from '@/modules/entities/garant/infoblock/model';

interface PackageFormProps {
    initialData?: IGarantPackageCreate;
    onSubmit: (data: IGarantPackageCreate) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
    serverError?: ServerError;
}

export function PackageForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
    serverError,
}: PackageFormProps) {
    // Подготавливаем initialData с значениями по умолчанию для boolean полей
    const preparedInitialData: Partial<IGarantPackageCreate> = {
        ...initialData,
        // Явно устанавливаем false для boolean полей, если они не были установлены
        withABS: initialData?.withABS ?? false,
        isChanging: initialData?.isChanging ?? false,
        withDefault: initialData?.withDefault ?? false,
    };

    // Функция для нормализации данных перед отправкой
    const normalizeData = (data: IGarantPackageCreate): IGarantPackageCreate => {
        return {
            ...data,
            // Гарантируем, что все boolean поля присутствуют в отправляемых данных
            withABS: data.withABS ?? false,
            isChanging: data.isChanging ?? false,
            withDefault: data.withDefault ?? false,
        };
    };

    return (
        <EntityForm<IGarantPackageCreate, InfoblockListItem>
            initialData={preparedInitialData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            mode={mode}
            serverError={serverError}
            fields={packageFormFields}
            description={
                mode === 'create'
                    ? 'Заполните форму для создания нового пакета'
                    : 'Измените данные пакета'
            }
            normalizeData={normalizeData}
            defaultErrorMessage="Произошла ошибка при сохранении пакета"
        />
    );
}
