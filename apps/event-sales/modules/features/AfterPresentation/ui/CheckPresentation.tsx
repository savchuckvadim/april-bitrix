'use client';

import { FC, Fragment, useState } from 'react';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { GlassDialog } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { afterPresentationActions } from '../model/AfterPresentationSlice';
import {
    closeCheckPresentation,
    submitCheckPresentation,
} from '../model/AfterPresentationThunk';
import { getMissingRequiredIds } from '../lib/check-presentation.validation';
import { getFiveKGroup, isFiveKCode } from '../lib/check-presentation.groups';
import type { CheckPresentationItem } from '../type/check-presentation-type';
import { CheckPresentationField } from './components/CheckPresentationField';

/**
 * Опросник после презентации (обязательный шаг перед отправкой на доменах
 * с withCheckPresentation). Валидация обязательных полей — при сохранении.
 *
 * Две колонки: слева разговор (обязательные xo_* и «Хвост»), справа «Пять К»
 * с тонкими полосами-разделителями категорий. Одна колонка на 21 вопрос
 * превращала окно в бесконечный скролл; категории «КЛИЕНТ:» в каждом лейбле
 * дублировали друг друга — теперь категория написана один раз на полосе.
 * intensity="soft": в окне много полей с наведением, liquid-рефракция на
 * каждый mousemove здесь подтормаживала бы (см. GlassDialog JSDoc).
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
    const talkItems = sortedItems.filter(item => !isFiveKCode(item.code));
    const fiveKItems = sortedItems.filter(item => isFiveKCode(item.code));

    const renderField = (item: CheckPresentationItem) => (
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
    );

    return (
        <GlassDialog
            open={isActive}
            onOpenChange={open => !open && close()}
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
                <div className="space-y-3">{talkItems.map(renderField)}</div>

                <div className="space-y-3">
                    {fiveKItems.map((item, index) => {
                        const group = getFiveKGroup(item.code);
                        const prevCode = fiveKItems[index - 1]?.code;
                        const prevGroup = prevCode
                            ? getFiveKGroup(prevCode)
                            : null;
                        return (
                            <Fragment key={item.id}>
                                {group && group !== prevGroup && (
                                    <div
                                        className="flex items-center gap-2 pt-1"
                                        aria-hidden
                                    >
                                        <span className="text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase">
                                            {group}
                                        </span>
                                        <span className="h-px flex-1 bg-border" />
                                    </div>
                                )}
                                {renderField(item)}
                            </Fragment>
                        );
                    })}
                </div>
            </div>

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
        </GlassDialog>
    );
};
