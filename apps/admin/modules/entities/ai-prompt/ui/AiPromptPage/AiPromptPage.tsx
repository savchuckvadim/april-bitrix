'use client';

import { useEffect, useMemo, useState } from 'react';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
// Глубокий импорт чистого util аудита: его индекс тянет панель аудита.
import { toPortalOptions } from '@/modules/entities/ai-analytics-audit/lib/portal-options.util';
import { usePortals } from '@/modules/entities/portal';
import { useLlmPromptRun, useLlmPromptTargets } from '../../lib/hooks/use-llm-prompt';
import { fallbackTarget } from '../../lib/prompt-view';
import {
    AI_PROMPT_DEFAULT_TARGET,
    AI_PROMPT_NO_PORTAL,
    AI_PROMPT_TEXT,
    type LlmPromptRun,
    type LlmPromptRunResult,
    type LlmPromptTarget,
} from '../../model';
import { PromptForm, type PromptDraft } from './components/PromptForm';
import { PromptResult } from './components/PromptResult';

const EMPTY_DRAFT: PromptDraft = {
    target: AI_PROMPT_DEFAULT_TARGET,
    model: '',
    systemPrompt: '',
    userContent: '',
};

/**
 * Раздел «AI-аналитика ОП → Запрос к модели»: портал (для ключей), форма
 * запроса и ответ. Исполнители и их готовность приходят с бэка по домену;
 * выбранный исполнитель, ставший недоступным после смены портала,
 * заменяется первым доступным.
 */
export const AiPromptPage = () => {
    const portals = usePortals();
    const portalOptions = useMemo(
        () => [
            { value: AI_PROMPT_NO_PORTAL, label: AI_PROMPT_TEXT.noPortal },
            ...toPortalOptions(portals.data),
        ],
        [portals.data],
    );
    const [domain, setDomain] = useState<string | undefined>(undefined);
    const targets = useLlmPromptTargets(domain);
    const [draft, setDraft] = useState<PromptDraft>(EMPTY_DRAFT);
    const [result, setResult] = useState<LlmPromptRunResult | null>(null);
    const run = useLlmPromptRun();

    useEffect(() => {
        if (!targets.data) return;
        const next = fallbackTarget(targets.data.targets, draft.target);
        if (next !== draft.target) {
            setDraft((current) => ({ ...current, target: next as LlmPromptTarget }));
        }
    }, [targets.data, draft.target]);

    const submit = () => {
        const userContent = draft.userContent.trim();
        if (!userContent) return;
        const body: LlmPromptRun = {
            target: draft.target,
            userContent,
            ...(domain ? { domain } : {}),
            ...(draft.systemPrompt.trim()
                ? { systemPrompt: draft.systemPrompt.trim() }
                : {}),
            ...(draft.model.trim() ? { model: draft.model.trim() } : {}),
        };
        run.mutate(body, { onSuccess: setResult });
    };

    return (
        <div className="space-y-4">
            <FieldCombobox
                id="ai-prompt-portal"
                label={AI_PROMPT_TEXT.portal}
                options={portalOptions}
                value={domain ?? AI_PROMPT_NO_PORTAL}
                onChange={(value) =>
                    setDomain(value === AI_PROMPT_NO_PORTAL ? undefined : value)
                }
                placeholder={AI_PROMPT_TEXT.portalPlaceholder}
                searchPlaceholder={AI_PROMPT_TEXT.portalSearch}
                emptyText={AI_PROMPT_TEXT.portalEmpty}
                hint={AI_PROMPT_TEXT.portalHint}
                className="max-w-md"
            />
            {targets.isError && (
                <HookNotice
                    tone="error"
                    title={AI_PROMPT_TEXT.targetsError}
                    message={getApiErrorMessage(targets.error)}
                />
            )}
            <PromptForm
                draft={draft}
                onChange={setDraft}
                targets={targets.data?.targets}
                targetsLoading={targets.isLoading}
                pending={run.isPending}
                onSubmit={submit}
            />
            <PromptResult result={result} pending={run.isPending} />
        </div>
    );
};
