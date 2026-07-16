'use client';

import * as React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    useCreateDepartamentDb,
    useDeleteDepartamentDb,
    usePortalDepartaments,
    useUpdateDepartamentDb,
} from '../../lib/hooks';
import type { UpdatePortalDepartamentInput } from '../../lib/model/departament';
import { DepartamentDbRow } from './DepartamentDbRow';
import { DepartamentDbCreateForm } from './DepartamentDbCreateForm';

/**
 * Администрирование строк `departaments` (PortalDB) портала: полный CRUD,
 * включая `is_multiple` (собирать ли ЦУП из разрозненных отделов) и
 * `multiple_tag` (тэг поиска: ОП / ОС / custom).
 */
export function DepartamentDbTable({ portalId }: { portalId: number }) {
    const rows = usePortalDepartaments(portalId);
    const create = useCreateDepartamentDb();
    const update = useUpdateDepartamentDb();
    const remove = useDeleteDepartamentDb();

    const [notice, setNotice] = React.useState<string | null>(null);
    const pending = create.isPending || update.isPending || remove.isPending;

    const fail = (e: unknown) =>
        setNotice(e instanceof Error ? e.message : 'Ошибка запроса');

    const onSave = (id: number, dto: UpdatePortalDepartamentInput) => {
        setNotice(null);
        update.mutate(
            { id, dto },
            {
                onSuccess: () => setNotice(`Отдел #${id} обновлён.`),
                onError: fail,
            },
        );
    };

    const onDelete = (id: number) => {
        setNotice(null);
        remove.mutate(id, {
            onSuccess: () => setNotice(`Отдел #${id} удалён.`),
            onError: fail,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Отделы в PortalDB — администрирование</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {notice && <p className="text-xs text-amber-600">{notice}</p>}

                {rows.isLoading ? (
                    <p className="text-sm text-muted-foreground">Загрузка…</p>
                ) : (rows.data ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        В PortalDB нет отделов этого портала.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">ID</TableHead>
                                    <TableHead className="w-24">Группа</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead className="w-28">Bitrix ID</TableHead>
                                    <TableHead className="w-24">Multiple</TableHead>
                                    <TableHead className="w-56">Тэг поиска</TableHead>
                                    <TableHead className="w-48">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(rows.data ?? []).map((row) => (
                                    <DepartamentDbRow
                                        key={row.id}
                                        row={row}
                                        pending={pending}
                                        onSave={onSave}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="space-y-2">
                    <p className="text-sm font-medium">Создать отдел вручную</p>
                    <DepartamentDbCreateForm
                        portalId={portalId}
                        pending={create.isPending}
                        onCreate={(dto) => {
                            setNotice(null);
                            create.mutate(dto, {
                                onSuccess: (r) =>
                                    setNotice(`Отдел #${r.id} создан.`),
                                onError: fail,
                            });
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}