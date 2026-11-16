'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
import {
    isPreviewPending,
    useMethodologyPreviewState,
    useStartMethodologyPreview,
} from '../../../lib/hooks/use-methodology-preview';
import { toMethodologyPreviewView } from '../../../lib/methodology-preview-view.util';
import type { MethodologyCatalog, MethodologyConfig } from '../../../model';
import {
    METHODOLOGY_PREVIEW_TEXT,
    TRANSCRIPTION_ID_PATTERN,
} from '../../../model/methodology-preview';
import { PreviewResult } from './PreviewResult';

interface PreviewPanelProps {
    domain: string | undefined;
    /** Черновик из формы — как есть, без сохранения. */
    config: MethodologyConfig;
    catalog: MethodologyCatalog | undefined;
}

/**
 * Проверка черновика на одном уже разобранном звонке портала: запуск,
 * опрос состояния и итог. Ничего не сохраняет.
 */
export const PreviewPanel = ({ domain, config, catalog }: PreviewPanelProps) => {
    const texts = METHODOLOGY_PREVIEW_TEXT;
    const [transcriptionId, setTranscriptionId] = useState('');
    const [previewId, setPreviewId] = useState<string | null>(null);
    const start = useStartMethodologyPreview();
    const preview = useMethodologyPreviewState(previewId);

    const id = transcriptionId.trim();
    const idValid = TRANSCRIPTION_ID_PATTERN.test(id);
    const pending = start.isPending || isPreviewPending(preview.data);

    const run = () => {
        if (!domain || !idValid) return;
        start.mutate(
            { domain, transcriptionId: id, config },
            { onSuccess: state => setPreviewId(state.previewId) },
        );
    };

    if (!domain) {
        return <p className="text-sm text-muted-foreground">{texts.noDomain}</p>;
    }
    const state = preview.data;
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{texts.intro}</p>
            <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                    <Label htmlFor="methodology-preview-transcription">
                        {texts.transcription}
                    </Label>
                    <Input
                        id="methodology-preview-transcription"
                        inputMode="numeric"
                        className="w-48"
                        value={transcriptionId}
                        disabled={pending}
                        onChange={event => setTranscriptionId(event.target.value)}
                    />
                </div>
                <Button onClick={run} disabled={pending || !idValid}>
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {pending ? texts.running : texts.run}
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">
                {id !== '' && !idValid ? texts.transcriptionInvalid : texts.transcriptionHint}
            </p>

            {state?.status === 'queued' && (
                <p className="text-sm text-muted-foreground">{texts.queued}</p>
            )}
            {state?.status === 'running' && (
                <p className="text-sm text-muted-foreground">{texts.inProgress}</p>
            )}
            {state?.status === 'failed' && (
                <HookNotice
                    tone="error"
                    title={texts.failed}
                    message={state.error ?? texts.failed}
                />
            )}
            {preview.isError && (
                <HookNotice
                    tone="error"
                    title={texts.stateError}
                    message={getApiErrorMessage(preview.error)}
                />
            )}
            {state?.status === 'done' && state.result && (
                <PreviewResult
                    view={toMethodologyPreviewView(
                        state.result,
                        catalog?.callTypes ?? [],
                        catalog?.sections ?? [],
                    )}
                />
            )}
        </div>
    );
};
