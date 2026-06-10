'use client';

import * as React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAiAdmin } from '@workspace/ai-api/src/generated/ai-admin/ai-admin';
import {
    PromptValidationIssueDto,
    PromptUpdateRequestDto,
} from '@workspace/ai-api/src/generated/model';
import { setAiAdminAuthHeaders } from '@workspace/ai-api';
import { AuthMode, PromptFormState, PromptKind, PromptMetaState, SaveResultState } from '../../model/types';

async function signHmacHex(secret: string, payload: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    return Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export function useAiAdminSettings() {
    const aiAdminApi = React.useMemo(() => getAiAdmin(), []);
    const [domain, setDomain] = React.useState('');
    const [authMode, setAuthMode] = React.useState<AuthMode>('manual');
    const [adminSecret, setAdminSecret] = React.useState('');
    const [adminTs, setAdminTs] = React.useState('');
    const [adminToken, setAdminToken] = React.useState('');
    const [activeKind, setActiveKind] = React.useState<PromptKind>('resume');
    const [selectedRetrivePath, setSelectedRetrivePath] = React.useState('');
    const [files, setFiles] = React.useState<File[]>([]);
    const [saveResult, setSaveResult] = React.useState<SaveResultState | null>(null);
    const [promptDrafts, setPromptDrafts] = React.useState<PromptFormState>({
        resume: '',
        recomendation: '',
    });
    const [promptMeta, setPromptMeta] = React.useState<PromptMetaState>({});

    const applyAuthHeaders = React.useCallback(async () => {
        const ts = adminTs || String(Math.floor(Date.now() / 1000));

        if (authMode === 'secret') {
            if (!adminSecret.trim()) {
                throw new Error('Укажи admin secret для подписи');
            }
            if (!domain.trim()) {
                throw new Error('Укажи домен');
            }
            const token = await signHmacHex(adminSecret, `${domain.trim()}:${ts}`);
            setAiAdminAuthHeaders({ ts, token });
            setAdminTs(ts);
            setAdminToken(token);
            return;
        }

        if (!adminToken.trim()) {
            throw new Error('Укажи X-Admin-Token');
        }
        setAiAdminAuthHeaders({ ts, token: adminToken.trim() });
        setAdminTs(ts);
    }, [adminSecret, adminToken, adminTs, authMode, domain]);

    const treeQuery = useQuery({
        queryKey: ['ai-admin-tree', domain],
        enabled: false,
        queryFn: async () => aiAdminApi.getDomainTreeApiV1HelperAiAdminDomainTreeGet(domain.trim()),
    });

    const promptQuery = useQuery({
        queryKey: ['ai-admin-prompt', domain, activeKind],
        enabled: false,
        queryFn: async () =>
            aiAdminApi.getPromptApiV1HelperAiAdminDomainPromptKindGet(domain.trim(), activeKind),
    });

    const loadWorkspace = React.useCallback(async () => {
        if (!domain.trim()) return;
        await applyAuthHeaders();
        await treeQuery.refetch();
        const resume = await aiAdminApi.getPromptApiV1HelperAiAdminDomainPromptKindGet(
            domain.trim(),
            'resume'
        );
        const recomendation = await aiAdminApi.getPromptApiV1HelperAiAdminDomainPromptKindGet(
            domain.trim(),
            'recomendation'
        );
        setPromptMeta({ resume, recomendation });
        setPromptDrafts({
            resume: resume.prompt ?? '',
            recomendation: recomendation.prompt ?? '',
        });
        setSaveResult(null);
    }, [aiAdminApi, applyAuthHeaders, domain, treeQuery]);

    const savePromptMutation = useMutation({
        mutationFn: async ({ kind, prompt }: { kind: PromptKind; prompt: string }) => {
            await applyAuthHeaders();
            const dto: PromptUpdateRequestDto = { prompt };
            return aiAdminApi.updatePromptApiV1HelperAiAdminDomainPromptKindPut(
                domain.trim(),
                kind,
                dto
            );
        },
        onSuccess: (result, variables) => {
            const issues: PromptValidationIssueDto[] = result.issues ?? [];
            setSaveResult({
                kind: variables.kind,
                ok: Boolean(result.validationPassed),
                issues,
                message: result.validationPassed
                    ? 'Промпт сохранен'
                    : 'Промпт не прошел валидацию',
            });
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (files.length === 0) {
                throw new Error('Выбери хотя бы один файл');
            }
            await applyAuthHeaders();
            return aiAdminApi.uploadDocumentsApiV1HelperAiAdminDomainUploadKindPost(
                domain.trim(),
                activeKind,
                { files: files as unknown as Blob[] },
                {
                    targetPath: selectedRetrivePath || undefined,
                    overwrite: false,
                }
            );
        },
        onSuccess: async () => {
            setFiles([]);
            await treeQuery.refetch();
        },
    });

    const deletePathMutation = useMutation({
        mutationFn: async (relativePath: string) => {
            await applyAuthHeaders();
            return aiAdminApi.deletePathApiV1HelperAiAdminDomainPathKindDelete(
                domain.trim(),
                activeKind,
                { path: relativePath }
            );
        },
        onSuccess: async () => {
            await treeQuery.refetch();
        },
    });

    const downloadMutation = useMutation({
        mutationFn: async (relativePath?: string) => {
            await applyAuthHeaders();
            return aiAdminApi.downloadDocumentsApiV1HelperAiAdminDomainDownloadKindGet(
                domain.trim(),
                activeKind,
                { path: relativePath || undefined }
            );
        },
    });

    return {
        domain,
        setDomain,
        authMode,
        setAuthMode,
        adminSecret,
        setAdminSecret,
        adminTs,
        setAdminTs,
        adminToken,
        setAdminToken,
        activeKind,
        setActiveKind,
        selectedRetrivePath,
        setSelectedRetrivePath,
        files,
        setFiles,
        promptDrafts,
        setPromptDrafts,
        promptMeta,
        saveResult,
        treeQuery,
        promptQuery,
        loadWorkspace,
        savePromptMutation,
        uploadMutation,
        deletePathMutation,
        downloadMutation,
    };
}
