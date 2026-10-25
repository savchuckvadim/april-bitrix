'use client';

import { Star } from 'lucide-react';
import { GlassDialog } from '@workspace/april-ui';
import { ChoiceChips } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    LIBRARY_KIND,
    LIBRARY_KIND_TITLE,
    LIBRARY_VISIBILITY_TITLE,
    type LibraryKind,
    type LibraryVisibility,
} from '@/modules/entities/library';
import { useSaveToLibrary } from '../hooks/use-save-to-library';

/** «В избранное» — текущая сборка в библиотеку заготовок с выбором видимости. */
export const SaveToLibraryButton = () => {
    const form = useSaveToLibrary();

    if (!form.canSave) return null;

    return (
        <>
            <Button size="sm" variant="outline" onClick={form.openDialog}>
                <Star className="h-4 w-4" />В избранное
            </Button>
            <GlassDialog open={form.open} onOpenChange={form.setOpen} intensity="soft">
                <DialogHeader>
                    <DialogTitle>Сохранить заготовку</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    {form.canPromote ? (
                        <div className="flex flex-col gap-1">
                            <Label>Что сохраняем</Label>
                            <ChoiceChips
                                ariaLabel="Вид заготовки"
                                value={form.kind}
                                options={[
                                    { value: LIBRARY_KIND.FAVORITE, label: LIBRARY_KIND_TITLE.favorite.many },
                                    { value: LIBRARY_KIND.PROMOTION, label: LIBRARY_KIND_TITLE.promotion.many },
                                ]}
                                onChange={value => form.setKind(value as LibraryKind)}
                            />
                        </div>
                    ) : null}
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="library-title">Название</Label>
                        <Input
                            id="library-title"
                            value={form.title}
                            onChange={event => form.setTitle(event.target.value)}
                            placeholder="Как найти эту заготовку потом"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>Кому видно</Label>
                        <ChoiceChips
                            ariaLabel="Видимость"
                            value={form.visibility}
                            options={form.visibilities.map(visibility => ({
                                value: visibility,
                                label: LIBRARY_VISIBILITY_TITLE[visibility],
                            }))}
                            onChange={value => form.setVisibility(value as LibraryVisibility)}
                        />
                    </div>
                    {form.error ? (
                        <p className="text-xs text-destructive">{form.error}</p>
                    ) : null}
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => form.setOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={() => void form.submit()} disabled={form.isSaving}>
                            {form.isSaving ? 'Сохраняю…' : 'Сохранить'}
                        </Button>
                    </div>
                </div>
            </GlassDialog>
        </>
    );
};
