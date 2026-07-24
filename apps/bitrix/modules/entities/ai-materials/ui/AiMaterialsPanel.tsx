'use client';

import * as React from 'react';
import {
    AButton,
    AModal,
    ASelect,
    PreloaderCard,
} from '@workspace/april-ui';
import { AiSettingsDocumentDto } from '@workspace/nest-api';
import {
    useAiMaterialsDocuments,
    useAiMaterialsKinds,
    useAiMaterialsPortals,
    useRemoveAiMaterial,
} from '../lib/hooks/use-ai-materials';
import { DocumentsTable } from './documents-table/DocumentsTable';
import { CallTypesCard } from './call-types-card/CallTypesCard';
import {
    MaterialEditorModal,
    MaterialEditorState,
} from './material-editor-modal/MaterialEditorModal';
import { MaterialViewModal } from './material-view-modal/MaterialViewModal';

/** Kind по умолчанию — инструкция классификатора звонков. */
const DEFAULT_KIND = 'call-classify';

/**
 * Кабинет клиента: управление СВОИМИ AI-материалами по доменам порталов
 * аккаунта. Свой документ перекрывает общий материал April для домена;
 * общие материалы видны только на чтение. Разделы (kind) и типы звонков
 * приходят с бэка (bitrix-app-client, тег «AI Settings Client»).
 */
export function AiMaterialsPanel() {
    const [domain, setDomain] = React.useState('');
    const [kind, setKind] = React.useState(DEFAULT_KIND);
    const [editorState, setEditorState] =
        React.useState<MaterialEditorState | null>(null);
    const [toView, setToView] =
        React.useState<AiSettingsDocumentDto | null>(null);
    const [toDelete, setToDelete] =
        React.useState<AiSettingsDocumentDto | null>(null);

    const portals = useAiMaterialsPortals();
    const kinds = useAiMaterialsKinds();
    const documents = useAiMaterialsDocuments(domain, kind);
    const removeMaterial = useRemoveAiMaterial();

    const portalList = Array.isArray(portals.data) ? portals.data : [];
    const kindList = Array.isArray(kinds.data) ? kinds.data : [];

    // Автовыбор первого портала, чтобы не заставлять кликать лишний раз.
    const firstPortalDomain = portalList[0]?.domain;
    React.useEffect(() => {
        if (domain === '' && firstPortalDomain) {
            setDomain(firstPortalDomain);
        }
    }, [domain, firstPortalDomain]);

    const selectedKindInfo = kindList.find((item) => item.kind === kind);

    const portalItems = portalList.map((portal) => ({
        id: portal.domain,
        name: portal.domain,
    }));
    const kindItems = kindList.map((item) => ({
        id: item.kind,
        name: item.title,
    }));

    const confirmDelete = () => {
        if (!toDelete || domain === '') return;
        removeMaterial.mutate(
            { domain, kind: toDelete.kind, fileName: toDelete.fileName },
            { onSuccess: () => setToDelete(null) },
        );
    };

    if (portals.isLoading) {
        return <PreloaderCard />;
    }
    if (portals.error) {
        return (
            <p className="p-4 text-sm text-red-600">
                Не удалось получить порталы: {portals.error.message}
            </p>
        );
    }
    if (portalList.length === 0) {
        return (
            <p className="p-4 text-sm text-muted-foreground">
                У аккаунта нет порталов — AI-материалы настраиваются по домену
                портала.
            </p>
        );
    }

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">AI-материалы</h1>
                <div className="w-56">
                    <AButton
                        title="Создать материал"
                        isActive={domain !== ''}
                        clickHendler={() =>
                            setEditorState({ mode: 'create', domain, kind })
                        }
                    />
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Здесь вы управляете материалами, по которым AI анализирует ваши
                звонки: критерии типов звонков, инструкции анализа, стандарты
                вашей компании. Ваши документы действуют только для вашего
                портала и перекрывают общие материалы April.
            </p>

            <div className="flex flex-wrap items-start gap-4">
                <div className="w-72">
                    <ASelect
                        label="Портал"
                        nameForHandler="domain"
                        items={portalItems}
                        current={portalItems.find(
                            (item) => item.id === domain,
                        )}
                        handleChange={(_field: string, value: string) =>
                            setDomain(value)
                        }
                    />
                </div>
                <div className="w-72">
                    <ASelect
                        label="Раздел материалов"
                        nameForHandler="kind"
                        items={kindItems}
                        current={kindItems.find((item) => item.id === kind)}
                        handleChange={(_field: string, value: string) =>
                            setKind(value)
                        }
                    />
                </div>
            </div>

            {selectedKindInfo && (
                <p className="text-sm">
                    <b>{selectedKindInfo.title}.</b>{' '}
                    {selectedKindInfo.description}
                </p>
            )}

            <DocumentsTable
                data={Array.isArray(documents.data) ? documents.data : []}
                isLoading={documents.isLoading}
                onView={(document) => setToView(document)}
                onEdit={(document) =>
                    setEditorState({
                        mode: 'edit',
                        target: {
                            domain,
                            kind: document.kind,
                            fileName: document.fileName,
                        },
                    })
                }
                onDelete={(document) => setToDelete(document)}
            />

            {domain !== '' && <CallTypesCard domain={domain} />}

            <MaterialEditorModal
                state={editorState}
                onClose={() => setEditorState(null)}
            />

            <MaterialViewModal
                target={
                    toView
                        ? {
                              domain,
                              kind: toView.kind,
                              fileName: toView.fileName,
                          }
                        : null
                }
                onClose={() => setToView(null)}
            />

            <AModal
                color="white"
                size="sm"
                isActive={toDelete !== null}
                cancel={() => setToDelete(null)}
            >
                <div className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">
                        Удалить документ?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Файл «{toDelete?.fileName ?? ''}» будет удалён и
                        перестанет влиять на анализ звонков. Действие
                        необратимо.
                    </p>
                    <div className="flex justify-end gap-2">
                        <div className="w-32">
                            <AButton
                                title="Отмена"
                                color="grey"
                                clickHendler={() => setToDelete(null)}
                            />
                        </div>
                        <div className="w-32">
                            <AButton
                                title={
                                    removeMaterial.isPending
                                        ? 'Удаляем…'
                                        : 'Удалить'
                                }
                                color="danger"
                                isActive={!removeMaterial.isPending}
                                clickHendler={confirmDelete}
                            />
                        </div>
                    </div>
                </div>
            </AModal>
        </div>
    );
}
