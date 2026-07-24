'use client';

import * as React from 'react';
import { AButton, AInput, AText, AModal, PreloaderMicro } from '@workspace/april-ui';
import {
    useKnowledgeContent,
    useUpsertKnowledgeText,
} from '../../lib/hooks/use-knowledge';
import {
    KNOWLEDGE_TEXT_FILE_PATTERN,
    KnowledgeDocumentTarget,
} from '../../lib/types/knowledge.types';

/** Состояние редактора: создание нового или правка существующего. */
export type DocumentEditorState =
    | { mode: 'create'; kind: string; domain?: string }
    | { mode: 'edit'; target: KnowledgeDocumentTarget };

interface DocumentEditorDialogProps {
    /** null — диалог закрыт. */
    state: DocumentEditorState | null;
    onClose: () => void;
}

/**
 * Редактор текстового документа базы знаний (.md/.txt/.json):
 * создание нового в выбранной паре (domain?, kind) или правка
 * существующего (текст подгружается, имя файла зафиксировано).
 * UI — компоненты монорепы @workspace/april-ui.
 */
export function DocumentEditorDialog({
    state,
    onClose,
}: DocumentEditorDialogProps) {
    const isEdit = state?.mode === 'edit';
    const target = isEdit ? state.target : null;
    const kind = isEdit ? state.target.kind : (state?.kind ?? '');
    const domain = isEdit ? state.target.domain : state?.domain;

    const [fileName, setFileName] = React.useState('');
    const [content, setContent] = React.useState('');

    const existing = useKnowledgeContent(target);
    const upsert = useUpsertKnowledgeText();

    // Инициализация полей при открытии/смене документа.
    React.useEffect(() => {
        if (!state) return;
        if (state.mode === 'edit') {
            setFileName(state.target.fileName);
        } else {
            setFileName('');
            setContent('');
        }
    }, [state]);

    // Текст существующего документа подставляем, когда он загрузился.
    React.useEffect(() => {
        if (isEdit && existing.data) {
            setContent(existing.data.text);
        }
    }, [isEdit, existing.data]);

    const fileNameDraft = fileName.trim();
    const isFileNameValid = KNOWLEDGE_TEXT_FILE_PATTERN.test(fileNameDraft);
    const canSave =
        isFileNameValid && content.trim() !== '' && !upsert.isPending;

    const handleSave = () => {
        upsert.mutate(
            { kind, fileName: fileNameDraft, content, domain },
            { onSuccess: onClose },
        );
    };

    return (
        <AModal color="white" size="lg" isActive={state !== null} cancel={onClose}>
            <div className="flex flex-col gap-3">
                <div>
                    <h2 className="text-lg font-semibold">
                        {isEdit
                            ? `Правка «${target?.fileName}»`
                            : 'Новый текстовый документ'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Тип: {kind} · База: {domain ?? 'общая'} · Повторное
                        сохранение с тем же именем перезаписывает документ.
                    </p>
                </div>

                {isEdit && existing.isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <PreloaderMicro phrase="Загружаем текст документа…" />
                    </div>
                ) : (
                    <>
                        {isEdit ? (
                            <p className="text-sm">
                                Файл: <b>{fileName}</b>
                            </p>
                        ) : (
                            <AInput<string>
                                label="Имя файла (instruction.md)"
                                errorMessage={
                                    fileNameDraft !== '' && !isFileNameValid
                                        ? 'Имя без путей, расширение .md / .txt / .json.'
                                        : null
                                }
                                nameForHandler="fileName"
                                value={fileName}
                                handleChange={(_field, value) =>
                                    setFileName(value)
                                }
                                handleOnFocus={() => undefined}
                            />
                        )}
                        <AText
                            label="Содержимое"
                            height={16}
                            nameForHandler="content"
                            current={content}
                            handleChange={setContent}
                            handleBlur={() => undefined}
                        />
                    </>
                )}

                <div className="flex justify-end gap-2">
                    <div className="w-32">
                        <AButton
                            title="Отмена"
                            color="grey"
                            clickHendler={onClose}
                        />
                    </div>
                    <div className="w-40">
                        <AButton
                            title={
                                upsert.isPending ? 'Сохраняем…' : 'Сохранить'
                            }
                            isActive={canSave}
                            clickHendler={handleSave}
                        />
                    </div>
                </div>
            </div>
        </AModal>
    );
}
