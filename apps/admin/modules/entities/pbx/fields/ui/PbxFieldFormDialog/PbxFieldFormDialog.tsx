'use client';

import * as React from 'react';
import {
    InstallEntityFieldDtoAppType,
    InstallEntityFieldDtoType,
} from '@workspace/nest-pbx-install-api';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import type { PbxTemplateField } from '../../../lib/model/common';

interface PbxFieldFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (field: PbxTemplateField) => Promise<void> | void;
    isSubmitting?: boolean;
}

const emptyDraft: PbxTemplateField = {
    name: '',
    code: '',
    type: InstallEntityFieldDtoType.string,
    appType: InstallEntityFieldDtoAppType.konstructor,
    bxFieldName: '',
    order: 0,
    isNeedUpdate: true,
    isMultiple: false,
    list: [],
};

/**
 * Build a custom template field (по образу шаблонных данных) and install it via
 * the install-fields endpoint. Enumeration values are entered one per line.
 */
export function PbxFieldFormDialog({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: PbxFieldFormDialogProps) {
    const [draft, setDraft] = React.useState<PbxTemplateField>(emptyDraft);
    const [listText, setListText] = React.useState('');

    React.useEffect(() => {
        if (open) {
            setDraft(emptyDraft);
            setListText('');
        }
    }, [open]);

    const change = <K extends keyof PbxTemplateField>(
        key: K,
        value: PbxTemplateField[K],
    ) => setDraft((prev) => ({ ...prev, [key]: value }));

    const isEnum =
        draft.type === InstallEntityFieldDtoType.enumeration ||
        draft.type === InstallEntityFieldDtoType.multiple;

    const submit = async () => {
        const list = isEnum
            ? listText
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((value, index) => ({
                      VALUE: value,
                      DEL: 'N' as const,
                      XML_ID: value,
                      CODE: value,
                      SORT: (index + 1) * 10,
                  }))
            : [];
        await onSubmit({ ...draft, list });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Новое поле</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label>Code</Label>
                        <Input
                            value={draft.code}
                            onChange={(e) => change('code', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Название</Label>
                        <Input
                            value={draft.name}
                            onChange={(e) => change('name', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Тип</Label>
                        <Select
                            value={draft.type}
                            onValueChange={(v) =>
                                change('type', v as PbxTemplateField['type'])
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(InstallEntityFieldDtoType).map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>App type</Label>
                        <Select
                            value={draft.appType}
                            onValueChange={(v) =>
                                change('appType', v as PbxTemplateField['appType'])
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(InstallEntityFieldDtoAppType).map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Bitrix field name</Label>
                        <Input
                            value={draft.bxFieldName}
                            onChange={(e) => change('bxFieldName', e.target.value)}
                            placeholder="UF_CRM_..."
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Order</Label>
                        <Input
                            type="number"
                            value={draft.order}
                            onChange={(e) => change('order', Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex gap-6 pt-1">
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={draft.isNeedUpdate}
                            onCheckedChange={(c) => change('isNeedUpdate', Boolean(c))}
                        />
                        isNeedUpdate
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={draft.isMultiple}
                            onCheckedChange={(c) => change('isMultiple', Boolean(c))}
                        />
                        isMultiple
                    </label>
                </div>

                {isEnum && (
                    <div className="space-y-1">
                        <Label>Значения списка (по одному в строке)</Label>
                        <Textarea
                            value={listText}
                            onChange={(e) => setListText(e.target.value)}
                            className="min-h-[120px]"
                        />
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={isSubmitting || !draft.code || !draft.name}
                    >
                        {isSubmitting ? 'Установка...' : 'Установить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
