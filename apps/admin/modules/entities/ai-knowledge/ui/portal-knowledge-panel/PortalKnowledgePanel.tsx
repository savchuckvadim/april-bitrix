'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { FilePlus2, Loader2, Upload } from 'lucide-react';
import { ConfirmDialog } from '@/modules/shared';
import {
    useDeleteKnowledgeDocument,
    useKnowledgeDocuments,
    useKnowledgeKinds,
    useUploadKnowledgeDocument,
} from '../../lib/hooks/use-knowledge';
import {
    KNOWLEDGE_ACCEPTED_EXTENSIONS,
    KNOWLEDGE_GENERAL_KIND,
    KNOWLEDGE_KIND_PATTERN,
    KNOWLEDGE_SHARED_SOURCE,
    KnowledgeDocument,
    KnowledgeDocumentTarget,
} from '../../lib/types/knowledge.types';
import { NEW_OPTION, SelectWithNew } from '../select-with-new';
import { KnowledgeTable } from '../knowledge-table';
import { DocumentContentDialog } from '../document-content-dialog';
import {
    DocumentEditorDialog,
    DocumentEditorState,
} from '../document-editor-dialog';

/** Адрес документа из строки списка: домен берём из source. */
function toTarget(document: KnowledgeDocument): KnowledgeDocumentTarget {
    return {
        kind: document.kind,
        fileName: document.fileName,
        domain:
            document.source === KNOWLEDGE_SHARED_SOURCE
                ? undefined
                : document.source,
    };
}

/**
 * RAG-хранилище КОНКРЕТНОГО портала — встраивается в карточку портала
 * (вкладка «База знаний» страницы настроек AI). Тот же функционал, что
 * на общей странице /ai-knowledge, но домен зафиксирован: выбор типа
 * материалов (kind), загрузка файлов, создание/правка текстов, просмотр
 * извлечённого текста, удаление. В списке видны и общие материалы
 * (general + выбранного kind) — ровно то, что попадёт в RAG портала.
 */
export function PortalKnowledgePanel({ domain }: { domain: string }) {
    const [kindValue, setKindValue] = React.useState<string>(
        KNOWLEDGE_GENERAL_KIND,
    );
    const [newKind, setNewKind] = React.useState('');
    const [toView, setToView] = React.useState<KnowledgeDocumentTarget | null>(
        null,
    );
    const [editorState, setEditorState] =
        React.useState<DocumentEditorState | null>(null);
    const [toDelete, setToDelete] = React.useState<KnowledgeDocument | null>(
        null,
    );
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { data: kinds } = useKnowledgeKinds();
    const uploadDocument = useUploadKnowledgeDocument();
    const deleteDocument = useDeleteKnowledgeDocument();

    const kindDraft = newKind.trim();
    const isKindDraftValid = KNOWLEDGE_KIND_PATTERN.test(kindDraft);
    const kind =
        kindValue === NEW_OPTION
            ? isKindDraftValid
                ? kindDraft
                : KNOWLEDGE_GENERAL_KIND
            : kindValue;

    const { data: documents, isLoading } = useKnowledgeDocuments({
        kind,
        domain,
    });

    const canUpload =
        (kindValue !== NEW_OPTION || isKindDraftValid) &&
        !uploadDocument.isPending;

    // Реестр kind'ов с бэка: известные — с человеческими названиями.
    const kindInfos = Array.isArray(kinds) ? kinds : [];
    const kindOptions = [
        ...(kindInfos.some((item) => item.kind === KNOWLEDGE_GENERAL_KIND)
            ? []
            : [
                  {
                      value: KNOWLEDGE_GENERAL_KIND,
                      label: KNOWLEDGE_GENERAL_KIND,
                  },
              ]),
        ...kindInfos.map((item) => ({
            value: item.kind,
            label: item.known ? `${item.title} — ${item.kind}` : item.kind,
        })),
    ];
    const selectedKindInfo = kindInfos.find((item) => item.kind === kind);

    /** Файлы грузим по одному: ошибка одного не прерывает остальные. */
    const handleFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        for (const file of Array.from(files)) {
            try {
                await uploadDocument.mutateAsync({ kind, file, domain });
            } catch {
                // тост об ошибке уже показан в хуке — продолжаем
            }
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const confirmDelete = () => {
        if (!toDelete) return;
        deleteDocument.mutate(toTarget(toDelete), {
            onSuccess: () => setToDelete(null),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <SelectWithNew
                    label="Тип материалов (kind)"
                    options={kindOptions}
                    newOptionLabel="Новый тип…"
                    value={kindValue}
                    onValueChange={setKindValue}
                    newValue={newKind}
                    onNewValueChange={setNewKind}
                    newPlaceholder="presentation"
                    isNewInvalid={kindDraft !== '' && !isKindDraftValid}
                    invalidHint="Kind: латиница, цифры и дефис, с буквы."
                />
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        disabled={!canUpload}
                        onClick={() =>
                            setEditorState({ mode: 'create', kind, domain })
                        }
                    >
                        <FilePlus2 className="h-4 w-4" />
                        Создать текст
                    </Button>
                    <Button
                        disabled={!canUpload}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {uploadDocument.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4" />
                        )}
                        Загрузить файлы
                    </Button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={KNOWLEDGE_ACCEPTED_EXTENSIONS}
                    className="hidden"
                    onChange={(event) =>
                        void handleFilesSelected(event.target.files)
                    }
                />
            </div>

            {selectedKindInfo && selectedKindInfo.known && (
                <p className="text-sm">
                    <b>{selectedKindInfo.title}.</b>{' '}
                    {selectedKindInfo.description}{' '}
                    <span className="text-muted-foreground">
                        Читает: {selectedKindInfo.consumer}
                    </span>
                </p>
            )}

            <p className="text-sm text-muted-foreground">
                Показаны документы, которые попадут в RAG портала {domain} для
                типа «{kind}»: материалы базы портала плюс общие (general).
            </p>

            <KnowledgeTable
                data={Array.isArray(documents) ? documents : []}
                isLoading={isLoading}
                onView={(document) => setToView(toTarget(document))}
                onEdit={(document) =>
                    setEditorState({ mode: 'edit', target: toTarget(document) })
                }
                onDelete={setToDelete}
            />

            <DocumentContentDialog
                target={toView}
                onClose={() => setToView(null)}
            />

            <DocumentEditorDialog
                state={editorState}
                onClose={() => setEditorState(null)}
            />

            <ConfirmDialog
                open={toDelete !== null}
                onOpenChange={(open) => {
                    if (!open) setToDelete(null);
                }}
                title="Удалить документ?"
                description={`Файл «${toDelete?.fileName ?? ''}» будет удалён из ${
                    toDelete && toDelete.source !== KNOWLEDGE_SHARED_SOURCE
                        ? `базы портала ${toDelete.source}`
                        : 'общей базы'
                } и перестанет попадать в ответы AI. Действие необратимо.`}
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
                isLoading={deleteDocument.isPending}
            />
        </div>
    );
}
