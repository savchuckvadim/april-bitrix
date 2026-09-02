'use client';

import { FC } from 'react';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { GlassDialog } from '@workspace/april-ui';
import { ProspectScale } from '@/modules/entities/EventCompany/ui/ProspectScale';
import { useCheckPresentation } from '../lib/hooks/use-check-presentation';
import { CheckPresentationField } from './components/CheckPresentationField';
import { CheckPresentationFiveK } from './components/CheckPresentationFiveK';

/**
 * Опросник после презентации (обязательный шаг перед отправкой на доменах
 * с withCheckPresentation). Валидация обязательных полей — при сохранении.
 *
 * Две колонки: слева разговор («Хвост», итоги: дата покупки, возражения,
 * прогноз), справа «Пять К». Одна колонка на все вопросы превращала окно в
 * бесконечный скролл. intensity="soft": в окне много полей с наведением,
 * liquid-рефракция на каждый mousemove здесь подтормаживала бы.
 *
 * Прогноз по компании стоит первым в колонке разговора: после презентации
 * цвет клиента обязан быть выставлен осознанно (владелец, 02.09) — та же
 * шкала, что в шапке, пишет в CRM сразу.
 */
export const CheckPresentation: FC = () => {
    const view = useCheckPresentation();
    const blockHandlers = {
        blocks: view.blocks,
        onBlockText: view.setBlockText,
        onBlockSub: view.setBlockSub,
        onBlockExpanded: view.setBlockExpanded,
    };

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
                    Разговор, итоги — и «Пять К» по категориям.
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
                <div className="space-y-3">
                    {view.isProspectRequired && (
                        <div className="space-y-1.5">
                            <Label
                                className={
                                    view.isProspectMissing
                                        ? 'text-destructive'
                                        : undefined
                                }
                            >
                                Прогноз по компании *
                            </Label>
                            <ProspectScale block />
                        </div>
                    )}

                    {view.talkItems.map(item => (
                        <CheckPresentationField
                            key={item.id}
                            item={item}
                            value={view.answers[item.id]}
                            isMissing={view.missingIds.includes(item.id)}
                            onChange={value => view.setAnswer(item.id, value)}
                            {...blockHandlers}
                        />
                    ))}
                </div>

                <CheckPresentationFiveK
                    items={view.fiveKItems}
                    answers={view.answers}
                    missingIds={view.missingIds}
                    onChange={view.setAnswer}
                    {...blockHandlers}
                />
            </div>

            {view.missingIds.length > 0 && (
                <p className="text-sm text-destructive">
                    Заполните обязательные поля
                </p>
            )}

            {view.isProspectMissing && (
                <p className="text-sm text-destructive">
                    Выставьте прогноз по компании — после презентации он
                    обязателен.
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
