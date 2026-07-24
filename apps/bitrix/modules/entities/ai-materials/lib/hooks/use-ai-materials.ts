'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    AiSettingsCallTypesResponseDto,
    AiSettingsDocumentContentDto,
    AiSettingsDocumentDto,
    AiSettingsDocumentParams,
    AiSettingsMutationResponseDto,
    AiSettingsPortalDto,
    AiSettingsRemoveParams,
    AiSettingsUpsertDto,
    KnowledgeKindInfoDto,
} from '@workspace/nest-api';
import { AiMaterialsHelper } from '../api/ai-materials-helper';
import { AI_MATERIALS_QUERY_KEY } from '../../model/consts';

const helper = new AiMaterialsHelper();

/** Человекочитаемое сообщение из ошибки запроса. */
function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return 'Неизвестная ошибка';
}

/** Порталы аккаунта (домены для настроек). */
export const useAiMaterialsPortals = () => {
    return useQuery<AiSettingsPortalDto[], Error>({
        queryKey: [AI_MATERIALS_QUERY_KEY, 'portals'],
        queryFn: () => helper.listPortals(),
    });
};

/** Реестр разделов материалов (kind) с названиями и описаниями. */
export const useAiMaterialsKinds = () => {
    return useQuery<KnowledgeKindInfoDto[], Error>({
        queryKey: [AI_MATERIALS_QUERY_KEY, 'kinds'],
        queryFn: () => helper.listKinds(),
    });
};

/** Документы пары (домен, kind); выключен, пока домен не выбран. */
export const useAiMaterialsDocuments = (domain: string, kind: string) => {
    return useQuery<AiSettingsDocumentDto[], Error>({
        queryKey: [AI_MATERIALS_QUERY_KEY, 'documents', domain, kind],
        queryFn: () => helper.listDocuments(domain, kind),
        enabled: domain !== '' && kind !== '',
        placeholderData: (prev) => prev,
    });
};

/** Текст документа; грузится только когда документ выбран. */
export const useAiMaterialsContent = (
    params: AiSettingsDocumentParams | null,
) => {
    return useQuery<AiSettingsDocumentContentDto, Error>({
        queryKey: [
            AI_MATERIALS_QUERY_KEY,
            'content',
            params?.domain ?? '',
            params?.kind ?? '',
            params?.fileName ?? '',
        ],
        queryFn: () => {
            if (!params) throw new Error('Документ не выбран');
            return helper.readDocument(params);
        },
        enabled: params !== null,
    });
};

/** Итоговый реестр типов звонков домена. */
export const useAiMaterialsCallTypes = (domain: string) => {
    return useQuery<AiSettingsCallTypesResponseDto, Error>({
        queryKey: [AI_MATERIALS_QUERY_KEY, 'call-types', domain],
        queryFn: () => helper.callTypes(domain),
        enabled: domain !== '',
    });
};

/** Сохранение клиентского документа + инвалидация списков. */
export const useUpsertAiMaterial = () => {
    const queryClient = useQueryClient();
    return useMutation<
        AiSettingsMutationResponseDto,
        Error,
        AiSettingsUpsertDto
    >({
        mutationFn: (dto) => helper.upsertDocument(dto),
        onSuccess: (result) => {
            void queryClient.invalidateQueries({
                queryKey: [AI_MATERIALS_QUERY_KEY],
            });
            toast.success(`Документ «${result.fileName}» сохранён`);
        },
        onError: (error, dto) => {
            toast.error(`Не удалось сохранить «${dto.fileName}»`, {
                description: getErrorMessage(error),
            });
        },
    });
};

/** Удаление клиентского документа + инвалидация списков. */
export const useRemoveAiMaterial = () => {
    const queryClient = useQueryClient();
    return useMutation<
        AiSettingsMutationResponseDto,
        Error,
        AiSettingsRemoveParams
    >({
        mutationFn: (params) => helper.removeDocument(params),
        onSuccess: (result) => {
            void queryClient.invalidateQueries({
                queryKey: [AI_MATERIALS_QUERY_KEY],
            });
            toast.success(`Документ «${result.fileName}» удалён`);
        },
        onError: (error) => {
            toast.error('Не удалось удалить документ', {
                description: getErrorMessage(error),
            });
        },
    });
};
