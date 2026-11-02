'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
import {
    useMethodologyDetail,
    useSaveMethodology,
    useValidateMethodology,
} from '../../lib/hooks/use-methodologies';
import { useMethodologyForm } from '../../lib/hooks/use-methodology-form';
import {
    canSave,
    type EditorSelection,
    formFromDetail,
    initialFormState,
    saveBlocker,
    toSaveBody,
} from '../../lib/methodology-form.state';
import {
    METHODOLOGIES_TEXT,
    type MethodologyCatalog,
    type MethodologyDetail,
    type MethodologyValidation,
} from '../../model';
import { AssistantPanel } from './components/AssistantPanel';
import { CapsEditor } from './components/CapsEditor';
import { CheckpointsEditor } from './components/CheckpointsEditor';
import { EditorHeader } from './components/EditorHeader';
import { JsonEditor } from './components/JsonEditor';
import { RulesEditor } from './components/RulesEditor';
import { ValidationNotice } from './components/ValidationNotice';

interface MethodologyEditorProps {
    selection: EditorSelection;
    domain: string | undefined;
    catalog: MethodologyCatalog | undefined;
    onClose: () => void;
    onSaved: (detail: MethodologyDetail) => void;
}

/**
 * Редактор-бриф методики: шапка, вкладки (пункты, ограничители, правила и
 * спирали, помощник, JSON), проверка и сохранение. Конфиг правится целиком,
 * проверяет его бэк тем же валидатором, что и разбор.
 */
export const MethodologyEditor = ({
    selection,
    domain,
    catalog,
    onClose,
    onSaved,
}: MethodologyEditorProps) => {
    const texts = METHODOLOGIES_TEXT.editor;
    const mode = selection.mode;
    const rowId = selection.mode === 'new' ? null : selection.id;
    const rowCode = selection.mode === 'new' ? null : selection.code;
    const detail = useMethodologyDetail(rowId, rowId ? null : rowCode, mode !== 'new');
    const form = useMethodologyForm(initialFormState(domain));
    const validate = useValidateMethodology();
    const save = useSaveMethodology();
    const [validation, setValidation] = useState<MethodologyValidation | null>(null);

    const { reset } = form;
    useEffect(() => {
        if (detail.data && mode !== 'new') reset(formFromDetail(detail.data, mode, domain));
    }, [detail.data, mode, domain, reset]);

    const { state } = form;
    const loading = mode !== 'new' && detail.isLoading;
    const blocker = saveBlocker(state);

    const runValidate = () =>
        validate.mutate(state.config, {
            onSuccess: setValidation,
        });
    const runSave = () =>
        save.mutate(toSaveBody(state), {
            onSuccess: saved => {
                form.markSaved(saved);
                setValidation(null);
                onSaved(saved);
            },
        });

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="flex flex-wrap items-center gap-2">
                            {state.source === 'new' ? texts.titleNew : texts.titleEdit(state.config.title)}
                            {state.dirty && <Badge variant="outline">{texts.dirty}</Badge>}
                        </CardTitle>
                        {state.source === 'builtin' && (
                            <CardDescription>{texts.builtinNote}</CardDescription>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" onClick={onClose}>
                            {texts.cancel}
                        </Button>
                        <Button variant="outline" onClick={runValidate} disabled={validate.isPending || loading}>
                            {validate.isPending ? texts.validating : texts.validate}
                        </Button>
                        <Button
                            onClick={runSave}
                            disabled={save.isPending || loading || !canSave(state)}
                            title={blocker ?? undefined}
                        >
                            {save.isPending ? texts.saving : texts.save}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                {detail.isError && (
                    <HookNotice
                        tone="error"
                        title={METHODOLOGIES_TEXT.detailError}
                        message={getApiErrorMessage(detail.error)}
                    />
                )}
                {loading ? (
                    <p className="text-sm text-muted-foreground">{texts.loading}</p>
                ) : (
                    <>
                        <EditorHeader form={form} domain={domain} catalog={catalog} />
                        <ValidationNotice
                            validation={validation}
                            storedErrors={detail.data?.errors ?? []}
                        />
                        <Tabs defaultValue="checkpoints">
                            <TabsList className="flex-wrap">
                                <TabsTrigger value="checkpoints">
                                    {texts.tabs.checkpoints} ({state.config.checkpoints.length})
                                </TabsTrigger>
                                <TabsTrigger value="caps">
                                    {texts.tabs.caps} ({state.config.caps.length})
                                </TabsTrigger>
                                <TabsTrigger value="rules">{texts.tabs.rules}</TabsTrigger>
                                <TabsTrigger value="assistant">{texts.tabs.assistant}</TabsTrigger>
                                <TabsTrigger value="json">{texts.tabs.json}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="checkpoints" className="pt-3">
                                <CheckpointsEditor
                                    checkpoints={state.config.checkpoints}
                                    methodologyTypes={state.config.types}
                                    catalog={catalog}
                                    onChange={checkpoints => form.patchConfig({ checkpoints })}
                                />
                            </TabsContent>
                            <TabsContent value="caps" className="pt-3">
                                <CapsEditor
                                    caps={state.config.caps}
                                    checkpoints={state.config.checkpoints}
                                    methodologyTypes={state.config.types}
                                    catalog={catalog}
                                    onChange={caps => form.patchConfig({ caps })}
                                />
                            </TabsContent>
                            <TabsContent value="rules" className="pt-3">
                                <RulesEditor
                                    principles={state.config.principles}
                                    spirals={state.config.spirals}
                                    methodologyTypes={state.config.types}
                                    catalog={catalog}
                                    onPrinciples={principles => form.patchConfig({ principles })}
                                    onSpirals={spirals => form.patchConfig({ spirals })}
                                />
                            </TabsContent>
                            <TabsContent value="assistant" className="pt-3">
                                <AssistantPanel
                                    domain={domain}
                                    code={state.config.code}
                                    title={state.config.title}
                                    onApply={config => {
                                        form.setConfig(config);
                                        setValidation(null);
                                    }}
                                />
                            </TabsContent>
                            <TabsContent value="json" className="pt-3">
                                <JsonEditor
                                    config={state.config}
                                    onApply={config => {
                                        form.setConfig(config);
                                        setValidation(null);
                                    }}
                                />
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
