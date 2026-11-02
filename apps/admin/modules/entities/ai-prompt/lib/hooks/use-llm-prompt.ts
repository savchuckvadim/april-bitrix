'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { LlmPromptHelper } from '../api/llm-prompt-helper';
import { AI_PROMPT_TEXT, type LlmPromptRun } from '../../model';

const helper = new LlmPromptHelper();
export const LLM_PROMPT_TARGETS_KEY = 'llm-prompt-targets';

/** Исполнители с готовностью для портала (без портала — общие ключи). */
export const useLlmPromptTargets = (domain: string | undefined) =>
    useQuery({
        queryKey: [LLM_PROMPT_TARGETS_KEY, domain ?? null],
        queryFn: () => helper.targets(domain),
        staleTime: 30_000,
    });

/** Выполнить промпт; ошибка — тост с причиной провайдера. */
export const useLlmPromptRun = () =>
    useMutation({
        mutationFn: (body: LlmPromptRun) => helper.run(body),
        onError: (error) =>
            toast.error(AI_PROMPT_TEXT.failed, {
                description: getApiErrorMessage(error),
            }),
    });
