'use client';

import { FC, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { afterPresentationActions } from '../model/AfterPresentationSlice';
import {
    closeCheckPresentation,
    submitCheckPresentation,
} from '../model/AfterPresentationThunk';
import { getMissingRequiredIds } from '../lib/check-presentation.validation';
import { CheckPresentationField } from './components/CheckPresentationField';

/**
 * Опросник после презентации (обязательный шаг перед отправкой на доменах
 * с withCheckPresentation). Валидация обязательных полей — при сохранении.
 */
export const CheckPresentation: FC = () => {
    const dispatch = useAppDispatch();
    const isActive = useAppSelector(s => s.afterPresentation.isActive);
    const items = useAppSelector(
        s => s.afterPresentation.checkPresentation.items,
    );
    const answers = useAppSelector(
        s => s.afterPresentation.checkPresentation.answers,
    );
    const [missingIds, setMissingIds] = useState<string[]>([]);

    const close = () => {
        setMissingIds([]);
        dispatch(closeCheckPresentation());
    };

    const save = () => {
        const missing = getMissingRequiredIds(items, answers);
        setMissingIds(missing);
        if (missing.length) return;
        dispatch(submitCheckPresentation());
    };

    const sortedItems = [...items].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    return (
        <Dialog open={isActive} onOpenChange={open => !open && close()}>
            <DialogContent className="max-h-[85svh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Опросник после презентации</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    {sortedItems.map(item => (
                        <CheckPresentationField
                            key={item.id}
                            item={item}
                            value={answers[item.id]}
                            isMissing={missingIds.includes(item.id)}
                            onChange={value => {
                                dispatch(
                                    afterPresentationActions.setAnswer({
                                        id: item.id,
                                        value,
                                    }),
                                );
                            }}
                        />
                    ))}

                    {missingIds.length > 0 && (
                        <p className="text-sm text-destructive">
                            Заполните обязательные поля
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={close}>
                            Отмена
                        </Button>
                        <Button onClick={save}>Сохранить</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
