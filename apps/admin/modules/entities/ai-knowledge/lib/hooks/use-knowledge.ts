'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KnowledgeHelper } from '../api/knowledge-helper';
import {
    KnowledgeDeleteResponse,
    KnowledgeDocument,
    KnowledgeDocumentContent,
    KnowledgeDocumentTarget,
    KnowledgeListParams,
    KnowledgeUploadResponse,
} from '../types/knowledge.types';

const helper = new KnowledgeHelper();

const KNOWLEDGE_KEY = 'ai-knowledge';

/** Достаёт человекочитаемое сообщение из ошибки запроса. */
function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return 'Неизвестная ошибка';
}

/** Kind-папки общей базы знаний (типы материалов). */
export const useKnowledgeKinds = () => {
    return useQuery<string[], Error>({
        queryKey: [KNOWLEDGE_KEY, 'kinds'],
        queryFn: () => helper.listKinds(),
    });
};

/** Домены порталов со своей клиентской базой знаний. */
export const useKnowledgeDomains = () => {
    return useQuery<string[], Error>({
        queryKey: [KNOWLEDGE_KEY, 'domains'],
        queryFn: () => helper.listDomains(),
    });
};

/** Документы для пары (domain?, kind): сначала general, затем kind. */
export const useKnowledgeDocuments = (params: KnowledgeListParams) => {
    return useQuery<KnowledgeDocument[], Error>({
        queryKey: [
            KNOWLEDGE_KEY,
            'documents',
            params.domain ?? '',
            params.kind ?? '',
        ],
        queryFn: () => helper.listDocuments(params),
        placeholderData: (prev) => prev,
    });
};

/** Извлечённый текст документа; грузится только когда документ выбран. */
export const useKnowledgeContent = (target: KnowledgeDocumentTarget | null) => {
    return useQuery<KnowledgeDocumentContent, Error>({
        queryKey: [
            KNOWLEDGE_KEY,
            'content',
            target?.domain ?? '',
            target?.kind ?? '',
            target?.fileName ?? '',
        ],
        queryFn: () => {
            if (!target) {
                throw new Error('Документ не выбран');
            }
            return helper.readContent(target);
        },
        enabled: target !== null,
    });
};

/** Загрузка документа. Инвалидирует список, kinds и домены (новые папки). */
export const useUploadKnowledgeDocument = () => {
    const queryClient = useQueryClient();
    return useMutation<
        KnowledgeUploadResponse,
        Error,
        { kind: string; file: File; domain?: string }
    >({
        mutationFn: ({ kind, file, domain }) =>
            helper.upload(kind, file, domain),
        onSuccess: (result) => {
            void queryClient.invalidateQueries({ queryKey: [KNOWLEDGE_KEY] });
            toast.success(`Файл «${result.fileName}» загружен`);
        },
        onError: (error, { file }) => {
            toast.error(`Не удалось загрузить «${file.name}»`, {
                description: getErrorMessage(error),
            });
        },
    });
};

/** Удаление документа из указанной базы. */
export const useDeleteKnowledgeDocument = () => {
    const queryClient = useQueryClient();
    return useMutation<KnowledgeDeleteResponse, Error, KnowledgeDocumentTarget>(
        {
            mutationFn: (target) => helper.delete(target),
            onSuccess: (result) => {
                void queryClient.invalidateQueries({
                    queryKey: [KNOWLEDGE_KEY],
                });
                toast.success(`Файл «${result.fileName}» удалён`);
            },
            onError: (error) => {
                toast.error('Не удалось удалить документ', {
                    description: getErrorMessage(error),
                });
            },
        },
    );
};
