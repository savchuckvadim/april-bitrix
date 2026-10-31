'use client';

import { FieldCombobox, type ComboboxOption } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { usePortalRegionForm } from '../../lib/hooks/use-portalRegion-form';
import type { UpdatePortalRegionDto } from '../../model';

interface PortalRegionsFormProps {
    initialData?: UpdatePortalRegionDto;
    sourceOptions: ComboboxOption[];
    onSubmit: (data: UpdatePortalRegionDto) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

/** Своя цена одного региона портала: регион-источник или любое число */
export function PortalRegionsForm({
    initialData,
    sourceOptions,
    onSubmit,
    onCancel,
    isLoading = false,
}: PortalRegionsFormProps) {
    const form = usePortalRegionForm(initialData);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Своя цена региона</CardTitle>
                <CardDescription>
                    Укажите регион, у которого брать рабс, или впишите число.
                    Налог и рабс с налогом считаются сами.
                </CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-2">
                        <FieldCombobox
                            className="min-w-0 flex-1"
                            label="Как у региона"
                            options={sourceOptions}
                            value={form.sourceValue}
                            onChange={form.setSource}
                            placeholder="Выберите регион"
                            searchPlaceholder="Найти регион"
                            emptyText="Регион не найден"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={form.clearOwnPrice}
                        >
                            Сбросить
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="own_abs">Свой рабс</Label>
                        <Input
                            id="own_abs"
                            type="number"
                            step="0.01"
                            {...form.ownAbsField}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="own_tax">Налоговый множитель</Label>
                        <Input id="own_tax" disabled {...form.ownTaxField} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="own_tax_abs">Рабс с налогом</Label>
                        <Input
                            id="own_tax_abs"
                            disabled
                            {...form.ownTaxAbsField}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="regionCode">Код региона</Label>
                        <Input
                            id="regionCode"
                            disabled
                            {...form.regionCodeField}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Отмена
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
