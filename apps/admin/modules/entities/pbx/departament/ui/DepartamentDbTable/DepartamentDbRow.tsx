'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import type {
    PortalDepartament,
    UpdatePortalDepartamentInput,
} from '../../lib/model/departament';
import { MultipleTagEditor } from './MultipleTagEditor';

/**
 * Editable PortalDB `departaments` row: name / title / bitrixId, the
 * `is_multiple` switch and the `multiple_tag` editor. «Сохранить» sends only
 * the changed fields as a PATCH.
 */
export function DepartamentDbRow({
    row,
    pending,
    onSave,
    onDelete,
}: {
    row: PortalDepartament;
    pending: boolean;
    onSave: (id: number, dto: UpdatePortalDepartamentInput) => void;
    onDelete: (id: number) => void;
}) {
    const [name, setName] = React.useState(row.name);
    const [title, setTitle] = React.useState(row.title);
    const [bitrixId, setBitrixId] = React.useState(String(row.bitrixId));
    const [isMultiple, setIsMultiple] = React.useState(row.isMultiple);
    const [multipleTag, setMultipleTag] = React.useState<string | null>(
        row.multipleTag,
    );

    React.useEffect(() => {
        setName(row.name);
        setTitle(row.title);
        setBitrixId(String(row.bitrixId));
        setIsMultiple(row.isMultiple);
        setMultipleTag(row.multipleTag);
    }, [row]);

    const patch: UpdatePortalDepartamentInput = {};
    if (name !== row.name) patch.name = name;
    if (title !== row.title) patch.title = title;
    if (Number(bitrixId) !== row.bitrixId && bitrixId !== '')
        patch.bitrixId = Number(bitrixId);
    if (isMultiple !== row.isMultiple) patch.isMultiple = isMultiple;
    if (multipleTag !== row.multipleTag) patch.multipleTag = multipleTag;
    const dirty = Object.keys(patch).length > 0;

    return (
        <TableRow>
            <TableCell className="font-mono text-xs">{row.id}</TableCell>
            <TableCell>
                <Badge variant="secondary">{row.group}</Badge>
            </TableCell>
            <TableCell>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-40"
                />
            </TableCell>
            <TableCell>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-40"
                />
            </TableCell>
            <TableCell>
                <Input
                    type="number"
                    value={bitrixId}
                    onChange={(e) => setBitrixId(e.target.value)}
                    className="w-24"
                />
            </TableCell>
            <TableCell>
                <Switch
                    checked={isMultiple}
                    onCheckedChange={setIsMultiple}
                    aria-label="Собирать ЦУП из разрозненных отделов"
                />
            </TableCell>
            <TableCell>
                <MultipleTagEditor value={multipleTag} onChange={setMultipleTag} />
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        disabled={!dirty || pending}
                        onClick={() => onSave(row.id, patch)}
                    >
                        Сохранить
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        disabled={pending}
                        onClick={() => onDelete(row.id)}
                    >
                        Удалить
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}