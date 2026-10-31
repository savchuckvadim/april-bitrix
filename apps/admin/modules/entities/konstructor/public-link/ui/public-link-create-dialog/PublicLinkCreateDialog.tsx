'use client';

import { FieldCombobox } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { PUBLIC_LINK_PERIOD_OPTIONS } from '../../consts/public-link.consts';
import { usePublicLinkCreateForm } from './hooks/use-public-link-create-form';

interface PublicLinkCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PublicLinkCreateDialog({
    open,
    onOpenChange,
}: PublicLinkCreateDialogProps) {
    const form = usePublicLinkCreateForm(() => onOpenChange(false));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Новая публичная ссылка</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="public-link-title">Название</Label>
                        <Input
                            id="public-link-title"
                            placeholder="Кому и зачем выдана"
                            maxLength={255}
                            value={form.title}
                            onChange={event => form.setTitle(event.target.value)}
                        />
                    </div>

                    <FieldCombobox
                        id="public-link-portal"
                        label="Портал каталога"
                        options={form.portalOptions}
                        value={form.domain}
                        onChange={form.setDomain}
                        placeholder="Выберите портал"
                        searchPlaceholder="Домен портала"
                        emptyText="Портал не найден"
                        hint="Договоры, регионы и единицы измерения берутся с этого портала."
                    />

                    <div className="space-y-2">
                        <Label htmlFor="public-link-period">Срок действия</Label>
                        <Select value={form.period} onValueChange={form.setPeriod}>
                            <SelectTrigger id="public-link-period">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PUBLIC_LINK_PERIOD_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button
                        disabled={!form.canSubmit || form.isSubmitting}
                        onClick={() => void form.submit()}
                    >
                        {form.isSubmitting ? 'Создаю…' : 'Создать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
