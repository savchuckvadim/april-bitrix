'use client';

import { FC } from 'react';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { GlassDialog } from '@workspace/april-ui';
import { useCheckPresentation } from '../lib/hooks/use-check-presentation';
import { CheckPresentationField } from './components/CheckPresentationField';
import { CheckPresentationFiveK } from './components/CheckPresentationFiveK';

/**
 * Опросник после презентации (обязательный шаг перед отправкой на доменах
 * с withCheckPresentation). Валидация обязательных полей — при сохранении.
 *
 * Две колонки: слева разговор (обязательные xo_* и «Хвост»), справа «Пять К».
 * Одна колонка на 21 вопрос превращала окно в бесконечный скролл.
 * intensity="soft": в окне много полей с наведением, liquid-рефракция на
 * каждый mousemove здесь подтормаживала бы (см. GlassDialog JSDoc).
 */
export const CheckPresentation: FC = () => {
    const view = useCheckPresentation();

    return (
        <GlassDialog
            open={view.isActive}
            onOpenChange={open => !open && view.close()}
            size="lg"
            intensity="soft"
            cardClassName="gap-4 max-h-[85svh] overflow-y-auto"
        >
            <DialogHeader>
                <DialogTitle>Опросник после презентации</DialogTitle>
                {/* Без «слева/справа»: в узком фрейме колонки складываются
                    в одну, и указание сторон врало бы. */}
                <DialogDescription>
                    Разговор — и «Пять К» по категориям.
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
                <div className="space-y-3">
                    {view.talkItems.map(item => (
                        <CheckPresentationField
                            key={item.id}
                            item={item}
                            value={view.answers[item.id]}
                            isMissing={view.missingIds.includes(item.id)}
                            onChange={value => view.setAnswer(item.id, value)}
                        />
                    ))}
                </div>

                <CheckPresentationFiveK
                    items={view.fiveKItems}
                    answers={view.answers}
                    missingIds={view.missingIds}
                    onChange={view.setAnswer}
                />
            </div>

            {view.missingIds.length > 0 && (
                <p className="text-sm text-destructive">
                    Заполните обязательные поля
                </p>
            )}

            {view.persistError && (
                <p className="text-sm text-destructive">{view.persistError}</p>
            )}

            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={view.close}
                    disabled={view.isSaving}
                >
                    Отмена
                </Button>
                <Button onClick={view.save} disabled={view.isSaving}>
                    {view.isSaving ? 'Сохраняем…' : 'Сохранить'}
                </Button>
            </div>
        </GlassDialog>
    );
};
