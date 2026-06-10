'use client';

import * as React from 'react';
import {
    PbxCreateFieldDto,
    PbxField,
} from '@/modules/entities/portal-bitrix/bitrix-fields';
import { Column, DataTable, ConfirmDialog } from '@/modules/shared/ui';
import { EntityFieldsContext } from '../model/types';
import { useDealFields } from '../lib/hooks/use-deal-fields';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog';
import { NestedEntitiesExplorer } from '@/modules/shared/ui';

type FieldDraft = Pick<PbxCreateFieldDto, 'type' | 'title' | 'name' | 'bitrixId' | 'bitrixCamelId' | 'code'>;

const emptyDraft: FieldDraft = {
    type: '',
    title: '',
    name: '',
    bitrixId: '',
    bitrixCamelId: '',
    code: '',
};

export function DealFieldsManager({ context }: { context: EntityFieldsContext }) {
    const {
        fields,
        isLoading,
        createField,
        updateField,
        deleteField,
        createBulk,
        isCreating,
        isUpdating,
        isBulkCreating,
    } = useDealFields(context);

    const [deleteTarget, setDeleteTarget] = React.useState<PbxField | null>(null);
    const [editTarget, setEditTarget] = React.useState<PbxField | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
    const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false);
    const [draft, setDraft] = React.useState<FieldDraft>(emptyDraft);
    const [bulkJson, setBulkJson] = React.useState('');
    const [bulkError, setBulkError] = React.useState<string | null>(null);
    const [selectedField, setSelectedField] = React.useState<PbxField | null>(null);

    const resetDraft = () => setDraft(emptyDraft);

    const columns: Column<PbxField>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', className: 'w-16' },
        { id: 'title', header: 'Title', accessorKey: 'title', className: 'w-52' },
        { id: 'name', header: 'Name', accessorKey: 'name', className: 'w-52' },
        { id: 'type', header: 'Type', accessorKey: 'type', className: 'w-28' },
        { id: 'code', header: 'Code', accessorKey: 'code', className: 'w-32' },
        {
            id: 'actions',
            header: 'Действия',
            className: 'w-48',
            cell: (row) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setEditTarget(row);
                        setDraft({
                            type: row.type,
                            title: row.title,
                            name: row.name,
                            bitrixId: row.bitrixId,
                            bitrixCamelId: row.bitrixCamelId,
                            code: row.code,
                        });
                    }}>
                        Изменить
                    </Button>
                    <Button variant="destructive" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(row);
                    }}>
                        Удалить
                    </Button>
                </div>
            ),
        },
    ];

    const onCreateSubmit = async () => {
        await createField(draft);
        setCreateDialogOpen(false);
        resetDraft();
    };

    const onEditSubmit = async () => {
        if (!editTarget) return;
        await updateField(editTarget.id, draft);
        setEditTarget(null);
        resetDraft();
    };

    const onBulkSubmit = async () => {
        try {
            setBulkError(null);
            const parsed = JSON.parse(bulkJson) as FieldDraft[];
            if (!Array.isArray(parsed)) {
                throw new Error('Ожидается JSON-массив полей');
            }
            await createBulk(parsed);
            setBulkDialogOpen(false);
            setBulkJson('');
        } catch (error) {
            setBulkError(error instanceof Error ? error.message : 'Ошибка парсинга JSON');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Связанные Bitrix Fields</h2>
                <div className="flex gap-2">
                    <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Массовая загрузка</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Bulk создание полей (JSON)</DialogTitle>
                            </DialogHeader>
                            <Textarea
                                value={bulkJson}
                                onChange={(e) => setBulkJson(e.target.value)}
                                className="min-h-[260px]"
                                placeholder='[{"type":"string","title":"Phone","name":"PHONE","bitrixId":"UF_CRM_PHONE","bitrixCamelId":"ufCrmPhone","code":"PHONE"}]'
                            />
                            {bulkError && <p className="text-sm text-destructive">{bulkError}</p>}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                                    Отмена
                                </Button>
                                <Button onClick={onBulkSubmit} disabled={isBulkCreating}>
                                    {isBulkCreating ? 'Загрузка...' : 'Загрузить'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Создать поле</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Новое поле</DialogTitle>
                            </DialogHeader>
                            <FieldDraftForm draft={draft} onChange={setDraft} />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                    Отмена
                                </Button>
                                <Button onClick={onCreateSubmit} disabled={isCreating}>
                                    {isCreating ? 'Создание...' : 'Создать'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {!selectedField && (
                <DataTable
                    data={fields}
                    columns={columns}
                    isLoading={isLoading}
                    emptyMessage="Поля не найдены"
                    onRowClick={setSelectedField}
                />
            )}

            {selectedField && (
                <div className="space-y-3">
                    <Button variant="outline" onClick={() => setSelectedField(null)}>
                        Назад к полям
                    </Button>
                    <NestedEntitiesExplorer
                        rootLabel={`Field: ${selectedField.title}`}
                        rootData={[selectedField] as unknown as Record<string, unknown>[]}
                        openFirstEntityByDefault
                    />
                </div>
            )}

            <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Редактирование поля</DialogTitle>
                    </DialogHeader>
                    <FieldDraftForm draft={draft} onChange={setDraft} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTarget(null)}>
                            Отмена
                        </Button>
                        <Button onClick={onEditSubmit} disabled={isUpdating}>
                            {isUpdating ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Подтвердите удаление"
                description={`Удалить поле "${deleteTarget?.title || ''}"?`}
                onConfirm={async () => {
                    if (!deleteTarget) return;
                    await deleteField(deleteTarget.id);
                    setDeleteTarget(null);
                }}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}

function FieldDraftForm({
    draft,
    onChange,
}: {
    draft: FieldDraft;
    onChange: React.Dispatch<React.SetStateAction<FieldDraft>>;
}) {
    const change = (key: keyof FieldDraft, value: string) =>
        onChange((prev) => ({ ...prev, [key]: value }));

    return (
        <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
                <Label>Type</Label>
                <Input value={draft.type} onChange={(e) => change('type', e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Title</Label>
                <Input value={draft.title} onChange={(e) => change('title', e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Name</Label>
                <Input value={draft.name} onChange={(e) => change('name', e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Bitrix ID</Label>
                <Input value={draft.bitrixId} onChange={(e) => change('bitrixId', e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Bitrix Camel ID</Label>
                <Input value={draft.bitrixCamelId} onChange={(e) => change('bitrixCamelId', e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Code</Label>
                <Input value={draft.code} onChange={(e) => change('code', e.target.value)} />
            </div>
        </div>
    );
}

