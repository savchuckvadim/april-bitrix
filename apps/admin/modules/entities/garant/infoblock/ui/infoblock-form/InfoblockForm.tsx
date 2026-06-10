'use client';

import { InfoblockCreateDto } from '@/modules/entities/garant/infoblock/model';
import { infoblockFormFields } from '@/modules/entities/garant/infoblock/lib/utils/infoblock-form-fields';
import { EntityForm } from '@/modules/shared/ui';
import { ServerError } from '@/modules/shared/lib/error-handler/types/server-error.types';
import { InfogroupResponseDto } from '@workspace/nest-api';

interface InfoblockFormProps {
    initialData?: InfoblockCreateDto;
    onSubmit: (data: InfoblockCreateDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
    serverError?: ServerError;
}

/**
 * Нормализует boolean поля инфоблока, устанавливая false для undefined значений
 */
const normalizeInfoblockBooleans = (data: Partial<InfoblockCreateDto>): InfoblockCreateDto => {
    return {
        ...data,
        isLa: data.isLa ?? false,
        isFree: data.isFree ?? false,
        isShowing: data.isShowing ?? false,
        isSet: data.isSet ?? false,
        isProduct: data.isProduct ?? false,
        isPackage: data.isPackage ?? false,
    } as InfoblockCreateDto;
};

export function InfoblockForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create',
    serverError,
}: InfoblockFormProps) {
    // Подготавливаем initialData с значениями по умолчанию для boolean полей
    const preparedInitialData = normalizeInfoblockBooleans(initialData || {});

    // Функция для нормализации данных перед отправкой (используем ту же логику)
    const normalizeData = normalizeInfoblockBooleans;

    return (
        <EntityForm<InfoblockCreateDto, InfogroupResponseDto>
            initialData={preparedInitialData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            mode={mode}
            serverError={serverError}
            fields={infoblockFormFields}
            title={initialData?.name || ''}
            description={
                mode === 'create'
                    ? 'Заполните форму для создания нового инфоблока'
                    : 'Измените данные инфоблока'
            }
            normalizeData={normalizeData}
            defaultErrorMessage="Произошла ошибка при сохранении инфоблока"
        />
    );
}
