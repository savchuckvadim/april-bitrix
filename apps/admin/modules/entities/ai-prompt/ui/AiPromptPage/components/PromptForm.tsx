'use client';

import type { KeyboardEvent } from 'react';
import { AButton } from '@workspace/april-ui';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { targetLabel } from '../../../lib/prompt-view';
import {
    AI_PROMPT_TEXT,
    type LlmPromptTarget,
    type LlmPromptTargetInfo,
} from '../../../model';

/** Черновик формы; поля — строки, чтобы textarea и input были управляемыми. */
export interface PromptDraft {
    target: LlmPromptTarget;
    model: string;
    systemPrompt: string;
    userContent: string;
}

interface PromptFormProps {
    draft: PromptDraft;
    onChange: (next: PromptDraft) => void;
    targets: readonly LlmPromptTargetInfo[] | undefined;
    targetsLoading: boolean;
    pending: boolean;
    onSubmit: () => void;
}

/**
 * Форма запроса: исполнитель (недоступные — серым с причиной), модель
 * VibeCode для тех, кто её принимает, системный промпт и текст. Ctrl+Enter
 * в тексте — выполнить.
 */
export const PromptForm = ({
    draft,
    onChange,
    targets,
    targetsLoading,
    pending,
    onSubmit,
}: PromptFormProps) => {
    const selected = targets?.find((target) => target.code === draft.target);
    const canRun = !pending && draft.userContent.trim().length > 0;

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && event.ctrlKey && canRun) {
            event.preventDefault();
            onSubmit();
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{AI_PROMPT_TEXT.title}</CardTitle>
                <CardDescription>{AI_PROMPT_TEXT.intro}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label>{AI_PROMPT_TEXT.target}</Label>
                        <Select
                            value={draft.target}
                            onValueChange={(value) =>
                                onChange({ ...draft, target: value as LlmPromptTarget })
                            }
                            disabled={targetsLoading || !targets}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={AI_PROMPT_TEXT.targetsLoading}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {(targets ?? []).map((target) => (
                                    <SelectItem
                                        key={target.code}
                                        value={target.code}
                                        disabled={Boolean(target.issue)}
                                    >
                                        {targetLabel(target)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selected && (
                            <p className="text-sm text-muted-foreground">
                                {selected.description}
                            </p>
                        )}
                    </div>
                    {selected?.acceptsModel && (
                        <div className="space-y-1">
                            <Label htmlFor="ai-prompt-model">
                                {AI_PROMPT_TEXT.model}
                            </Label>
                            <Input
                                id="ai-prompt-model"
                                value={draft.model}
                                placeholder={AI_PROMPT_TEXT.modelPlaceholder}
                                onChange={(event) =>
                                    onChange({ ...draft, model: event.target.value })
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="ai-prompt-system">
                        {AI_PROMPT_TEXT.systemPrompt}
                    </Label>
                    <Textarea
                        id="ai-prompt-system"
                        rows={3}
                        value={draft.systemPrompt}
                        placeholder={AI_PROMPT_TEXT.systemPromptPlaceholder}
                        onChange={(event) =>
                            onChange({ ...draft, systemPrompt: event.target.value })
                        }
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                        <Label htmlFor="ai-prompt-content">
                            {AI_PROMPT_TEXT.userContent}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            {AI_PROMPT_TEXT.chars(draft.userContent.length)}
                        </span>
                    </div>
                    <Textarea
                        id="ai-prompt-content"
                        rows={10}
                        value={draft.userContent}
                        placeholder={AI_PROMPT_TEXT.userContentPlaceholder}
                        onChange={(event) =>
                            onChange({ ...draft, userContent: event.target.value })
                        }
                        onKeyDown={onKeyDown}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <AButton
                        title={pending ? AI_PROMPT_TEXT.running : AI_PROMPT_TEXT.run}
                        size="big"
                        isActive={canRun}
                        clickHendler={canRun ? onSubmit : undefined}
                    />
                    <span className="text-xs text-muted-foreground">
                        {AI_PROMPT_TEXT.runHint}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
