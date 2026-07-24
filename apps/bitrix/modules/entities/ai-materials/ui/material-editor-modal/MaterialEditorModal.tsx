'use client';

import * as React from 'react';
import {
    AButton,
    AInput,
    AModal,
    AText,
    PreloaderMicro,
} from '@workspace/april-ui';
import { AiSettingsDocumentParams } from '@workspace/nest-api';
import {
    useAiMaterialsContent,
    useUpsertAiMaterial,
} from '../../lib/hooks/use-ai-materials';
import { AI_MATERIALS_TEXT_FILE_PATTERN } from '../../model/consts';

/** Состояние редактора: создание в паре (domain, kind) или правка документа. */
export type MaterialEditorState =
    | { mode: 'create'; domain: string; kind: string }
    | { mode: 'edit'; target: AiSettingsDocumentParams };

interface MaterialEditorModalProps {
    /** null — модалка закрыта. */
    state: MaterialEditorState | null;
    onClose: () => void;
}

/**
 * Редактор клиентского материала (.md/.txt/.json): создание нового
 * документа домена или правка существующего (текст подгружается,
 * имя файла зафиксировано). UI — компоненты @workspace/april-ui.
 */
export function MaterialEditorModal({
    state,
    onClose,
}: MaterialEditorModalProps) {
    const isEdit = state?.mode === 'edit';
    const target = isEdit ? state.target : null;
    const domain = isEdit ? state.target.domain : (state?.domain ?? '');
    const kind = isEdit ? state.target.kind : (state?.kind ?? '');

    const [fileName, setFileName] = React.useState('');
    const [content, setContent] = React.useState('');

    const existing = useAiMaterialsContent(target);
    const upsert = useUpsertAiMaterial();

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

    // Текст существующего документа подставляем после загрузки.
    React.useEffect(() => {
        if (isEdit && existing.data) {
            setContent(existing.data.text);
        }
    }, [isEdit, existing.data]);

    const fileNameDraft = fileName.trim();
    const isFileNameValid = AI_MATERIALS_TEXT_FILE_PATTERN.test(fileNameDraft);
    const canSave =
        isFileNameValid && content.trim() !== '' && !upsert.isPending;

    const handleSave = () => {
        upsert.mutate(
            { domain, kind, fileName: fileNameDraft, content },
            { onSuccess: onClose },
        );
    };

    return (
        <AModal
            color="white"
            size="lg"
            isActive={state !== null}
            cancel={onClose}
        >
            <div className="flex flex-col gap-3">
                <div>
                    <h2 className="text-lg font-semibold">
                        {isEdit
                            ? `Правка «${target?.fileName}»`
                            : 'Новый материал'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Раздел: {kind} · Портал: {domain}. Ваш документ
                        перекрывает общие материалы April для этого домена.
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
                                label="Имя файла (наши-критерии.md)"
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
                            height={14}
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
