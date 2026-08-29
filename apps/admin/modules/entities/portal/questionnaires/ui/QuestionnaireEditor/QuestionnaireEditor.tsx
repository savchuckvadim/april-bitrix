'use client';

import Link from 'next/link';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft, Loader2, RefreshCw, Save } from 'lucide-react';
import {
    QUESTIONNAIRES_TEXT,
    QUESTIONNAIRE_EDITOR_TEXT,
} from '../../consts/questionnaires.const';
import { useQuestionnaireEditorScreen } from '../../lib/hooks/use-questionnaire-editor-screen';
import { QuestionnaireCheckPanel } from './components/QuestionnaireCheckPanel';
import { QuestionnaireConditionsCard } from './components/QuestionnaireConditionsCard';
import { QuestionnaireFieldPickerDialog } from './components/QuestionnaireFieldPickerDialog';
import { QuestionnaireHeaderForm } from './components/QuestionnaireHeaderForm';
import { QuestionnaireIssuesPanel } from './components/QuestionnaireIssuesPanel';
import { QuestionnaireItemsList } from './components/QuestionnaireItemsList';
import { QuestionnaireSyncPanel } from './components/QuestionnaireSyncPanel';

interface QuestionnaireEditorProps {
    portalId: number;
    /** Идентификатор анкеты либо `new` для ещё не созданной. */
    questionnaireId: string;
}

/**
 * Редактор анкеты — одной страницей, без мастера.
 *
 * Шапка, условия показа и состав правятся рядом, потому что смысл каждого
 * куска виден только вместе с остальными: одно и то же условие значит
 * разное у анкеты планирования и у анкеты отчёта, а тип отображения вопроса
 * зависит от того, в какое поле уходит ответ. Пошаговый мастер прятал бы
 * ровно эти связи.
 *
 * Сохранение задаёт состав ЦЕЛИКОМ: вопрос, которого нет в теле, бэк гасит.
 * Поэтому убрать вопрос из уже сохранённой анкеты можно только гашением —
 * иначе ответы, записанные в CRM, остались бы без вопроса.
 */
export const QuestionnaireEditor = ({
    portalId,
    questionnaireId,
}: QuestionnaireEditorProps) => {
    const screen = useQuestionnaireEditorScreen(portalId, questionnaireId);
    const listUrl = `/portal/${portalId}/questionnaires`;

    if (screen.isLoading) {
        return (
            <p className="text-sm text-muted-foreground">
                {QUESTIONNAIRES_TEXT.loading}
            </p>
        );
    }

    if (screen.isError) {
        return (
            <p className="text-sm text-destructive">
                {screen.isSchemaError
                    ? QUESTIONNAIRES_TEXT.schemaLoadError
                    : QUESTIONNAIRES_TEXT.loadError}
            </p>
        );
    }

    const savedCodes = (screen.saved?.items ?? []).map(item => item.code);

    return (
        <div className="flex flex-col gap-4 pb-16">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl space-y-1">
                    <Link
                        href={listUrl}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        {QUESTIONNAIRE_EDITOR_TEXT.backToList}
                    </Link>
                    <h1 className="text-lg font-semibold">
                        {screen.draft.title ||
                            QUESTIONNAIRE_EDITOR_TEXT.createTitle}
                    </h1>
                    {screen.isDirty && (
                        <Badge variant="outline">
                            {QUESTIONNAIRE_EDITOR_TEXT.unsaved}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Проверка сверяет то, что уже лежит в базе, поэтому у
                        несохранённого черновика она заперта с причиной. */}
                    <Button
                        variant="outline"
                        disabled={
                            !!screen.checkBlockReason || screen.isChecking
                        }
                        title={
                            screen.checkBlockReason ??
                            QUESTIONNAIRE_EDITOR_TEXT.checkHint
                        }
                        onClick={screen.runCheck}
                    >
                        {screen.isChecking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        {screen.isChecking
                            ? QUESTIONNAIRES_TEXT.checking
                            : QUESTIONNAIRES_TEXT.check}
                    </Button>
                    <Button
                        variant="ghost"
                        disabled={!screen.isDirty || screen.isSaving}
                        onClick={screen.reset}
                    >
                        {QUESTIONNAIRE_EDITOR_TEXT.reset}
                    </Button>
                    {/* Сохранение заперто и пока не прочитан список анкет:
                        код — ключ upsert-а, и непроверенный код заменил бы
                        чужую анкету. Причина висит подсказкой на кнопке. */}
                    <Button
                        disabled={!screen.canSave}
                        title={screen.codeCheckReason ?? undefined}
                        onClick={screen.submit}
                    >
                        <Save className="h-4 w-4" />
                        {screen.isSaving
                            ? QUESTIONNAIRES_TEXT.saving
                            : QUESTIONNAIRES_TEXT.save}
                    </Button>
                </div>
            </div>

            {/* Фоновая сверка не прошла или поля читались урезанным
                способом. Пометка неброская: анкета правится и без
                Битрикса — красный экран выглядел бы поломкой самой
                анкеты. */}
            {screen.checkNotice && (
                <p className="text-xs text-muted-foreground">
                    {screen.checkNotice}
                </p>
            )}

            {/* Что в Битриксе разошлось с анкетой. Панель появляется сама
                после сверки при открытии — и только когда есть что
                показать. */}
            {screen.syncReport && (
                <QuestionnaireSyncPanel
                    report={screen.syncReport}
                    blockReason={screen.syncBlockReason}
                    isApplying={screen.isApplyingSync}
                    onApplyAll={screen.applyAllSync}
                    onApplyItem={screen.applyItemSync}
                    onTogglePick={screen.toggleSyncPick}
                    onHide={screen.hideSyncReport}
                />
            )}

            {/* Итог сверки привязок — сразу под кнопкой, которая её
                запустила: чинить пойдут по этому списку. */}
            {screen.checkSummary && (
                <QuestionnaireCheckPanel
                    summary={screen.checkSummary}
                    onHide={screen.hideCheckResult}
                />
            )}

            <QuestionnaireHeaderForm
                draft={screen.draft}
                schema={screen.schema}
                isNew={screen.isNew}
                appCodes={screen.appCodes}
                codeConflict={screen.codeConflict}
                codeCheckError={screen.codeCheckError}
                onPatch={screen.patchDraft}
                onTitleChange={screen.setTitle}
                onPurposeChange={screen.setPurpose}
            />

            <QuestionnaireConditionsCard
                draft={screen.draft}
                schema={screen.schema}
                onChange={conditions => screen.patchDraft({ conditions })}
            />

            <QuestionnaireItemsList
                items={screen.draft.items}
                schema={screen.schema}
                issues={screen.issues}
                savedCodes={savedCodes}
                onPatchItem={screen.patchItem}
                onPickField={index =>
                    screen.openFieldPicker({ mode: 'replace', index })
                }
                onSyncField={screen.syncItemField}
                syncingIndex={screen.syncingItemIndex}
                onReorder={screen.reorder}
                onRemoveItem={screen.removeItem}
                onAddFields={() => screen.openFieldPicker({ mode: 'add' })}
                onAddComment={screen.addCommentItem}
            />

            <QuestionnaireIssuesPanel issues={screen.issues} />

            {/* Пикер монтируется только открытым: он ходит в живой Битрикс,
                и держать этот запрос на каждом открытии редактора незачем. */}
            {screen.pickerTarget && (
                <QuestionnaireFieldPickerDialog
                    open
                    portalId={portalId}
                    domain={screen.domain}
                    schema={screen.schema}
                    // Условия решают, доступны ли поля смарта: пикер
                    // читает их из черновика, а не из сохранённой анкеты —
                    // владелец только что мог добавить нужное условие.
                    conditions={screen.draft.conditions}
                    isSingle={screen.pickerTarget.mode === 'replace'}
                    onOpenChange={open => {
                        if (!open) screen.openFieldPicker(null);
                    }}
                    onApply={screen.applyPickedFields}
                />
            )}
        </div>
    );
};
