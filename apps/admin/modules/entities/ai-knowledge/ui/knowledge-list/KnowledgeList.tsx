'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Loader2, Upload } from 'lucide-react';
import { ConfirmDialog } from '@/modules/shared';
import {
    useDeleteKnowledgeDocument,
    useKnowledgeDocuments,
    useKnowledgeDomains,
    useKnowledgeKinds,
    useUploadKnowledgeDocument,
} from '../../lib/hooks/use-knowledge';
import {
    KNOWLEDGE_ACCEPTED_EXTENSIONS,
    KNOWLEDGE_DOMAIN_PATTERN,
    KNOWLEDGE_GENERAL_KIND,
    KNOWLEDGE_KIND_PATTERN,
    KNOWLEDGE_SHARED_SOURCE,
    KnowledgeDocument,
    KnowledgeDocumentTarget,
} from '../../lib/types/knowledge.types';
import { NEW_OPTION, SelectWithNew } from '../select-with-new';
import { KnowledgeTable } from '../knowledge-table';
import { DocumentContentDialog } from '../document-content-dialog';

/** Сентинел общей базы в селекте базы знаний. */
const SHARED_BASE = '__shared__';

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
 * Раздел «База знаний AI (RAG)»: выбор базы (общая / домен портала)
 * и типа (kind), список документов пары, загрузка файлов, просмотр
 * извлечённого текста и удаление с подтверждением.
 */
export function KnowledgeList() {
    const [baseValue, setBaseValue] = React.useState<string>(SHARED_BASE);
    const [newDomain, setNewDomain] = React.useState('');
    const [kindValue, setKindValue] = React.useState<string>(
        KNOWLEDGE_GENERAL_KIND,
    );
    const [newKind, setNewKind] = React.useState('');
    const [toView, setToView] = React.useState<KnowledgeDocumentTarget | null>(
        null,
    );
    const [toDelete, setToDelete] = React.useState<KnowledgeDocument | null>(
        null,
    );
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { data: kinds } = useKnowledgeKinds();
    const { data: domains } = useKnowledgeDomains();
    const uploadDocument = useUploadKnowledgeDocument();
    const deleteDocument = useDeleteKnowledgeDocument();

    // Черновики новых значений и их валидность (паттерны — как на бэке)
    const domainDraft = newDomain.trim();
    const kindDraft = newKind.trim();
    const isDomainDraftValid = KNOWLEDGE_DOMAIN_PATTERN.test(domainDraft);
    const isKindDraftValid = KNOWLEDGE_KIND_PATTERN.test(kindDraft);

    // Действующая пара (domain?, kind): невалидные черновики не применяем
    const domain =
        baseValue === SHARED_BASE
            ? undefined
            : baseValue === NEW_OPTION
              ? isDomainDraftValid
                  ? domainDraft
                  : undefined
              : baseValue;
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
        (baseValue !== NEW_OPTION || isDomainDraftValid) &&
        (kindValue !== NEW_OPTION || isKindDraftValid) &&
        !uploadDocument.isPending;

    const baseOptions = [
        { value: SHARED_BASE, label: 'Общая база' },
        ...(Array.isArray(domains) ? domains : []).map((item) => ({
            value: item,
            label: item,
        })),
    ];

    const kindOptions = Array.from(
        new Set([KNOWLEDGE_GENERAL_KIND, ...(Array.isArray(kinds) ? kinds : [])]),
    ).map((item) => ({ value: item, label: item }));

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
        <>
            <div className="mb-4 flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">База знаний AI</h1>
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

            <div className="mb-4 flex flex-wrap items-start gap-4">
                <SelectWithNew
                    label="База знаний"
                    options={baseOptions}
                    newOptionLabel="Новый домен…"
                    value={baseValue}
                    onValueChange={setBaseValue}
                    newValue={newDomain}
                    onNewValueChange={setNewDomain}
                    newPlaceholder="portal.bitrix24.ru"
                    isNewInvalid={domainDraft !== '' && !isDomainDraftValid}
                    invalidHint="Домен: буквы, цифры, точки и дефис."
                />
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
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
                Показаны документы, которые попадут в RAG для выбранной пары:
                общие материалы (general) плюс материалы типа «{kind}»
                {domain ? ` базы портала ${domain}` : ' общей базы'}.
            </p>

            <KnowledgeTable
                data={Array.isArray(documents) ? documents : []}
                isLoading={isLoading}
                onView={(document) => setToView(toTarget(document))}
                onDelete={setToDelete}
            />

            <DocumentContentDialog
                target={toView}
                onClose={() => setToView(null)}
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
        </>
    );
}
