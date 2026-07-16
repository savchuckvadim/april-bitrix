'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { PBX_GROUPS, type PbxGroup } from '../../../lib/model/common';
import type { CreatePortalDepartamentInput } from '../../lib/model/departament';
import { MultipleTagEditor } from './MultipleTagEditor';

/** Create form for a PortalDB `departaments` row (full DB CRUD). */
export function DepartamentDbCreateForm({
    portalId,
    pending,
    onCreate,
}: {
    portalId: number;
    pending: boolean;
    onCreate: (dto: CreatePortalDepartamentInput) => void;
}) {
    const [group, setGroup] = React.useState<PbxGroup>('sales');
    const [name, setName] = React.useState('');
    const [title, setTitle] = React.useState('');
    const [bitrixId, setBitrixId] = React.useState('');
    const [isMultiple, setIsMultiple] = React.useState(false);
    const [multipleTag, setMultipleTag] = React.useState<string | null>(null);

    const valid = name.trim() !== '' && title.trim() !== '' && bitrixId !== '';

    const submit = () => {
        if (!valid) return;
        onCreate({
            portalId,
            group,
            name: name.trim(),
            title: title.trim(),
            bitrixId: Number(bitrixId),
            isMultiple,
            multipleTag,
        });
    };

    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
                <Label>Группа</Label>
                <Select value={group} onValueChange={(v) => setGroup(v as PbxGroup)}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PBX_GROUPS.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                                {g.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
                <Label>Bitrix ID</Label>
                <Input
                    type="number"
                    value={bitrixId}
                    onChange={(e) => setBitrixId(e.target.value)}
                    className="w-28"
                />
            </div>
            <div className="space-y-1">
                <Label>Multiple</Label>
                <div className="flex h-9 items-center">
                    <Switch
                        checked={isMultiple}
                        onCheckedChange={setIsMultiple}
                        aria-label="Собирать ЦУП из разрозненных отделов"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <Label>Тэг</Label>
                <MultipleTagEditor value={multipleTag} onChange={setMultipleTag} />
            </div>
            <Button onClick={submit} disabled={!valid || pending}>
                {pending ? 'Создание…' : 'Создать'}
            </Button>
        </div>
    );
}