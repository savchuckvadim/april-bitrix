'use client';

import { FC, ReactNode } from 'react';
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

/** Колонка окна: подпись сверху, содержимое стопкой. */
const SurveyColumn: FC<{ title: string; children: ReactNode }> = ({
    title,
    children,
}) => (
    <section className="flex min-w-0 flex-col gap-3">
        <h3 className="text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {title}
        </h3>
        {children}
    </section>
);

/**
 * Опросник после презентации (обязательный шаг перед отправкой на доменах
 * с withCheckPresentation). Валидация обязательных полей — при сохранении.
 *
 * Окно почти во весь фрейм и три колонки: блоки «Хвоста», итоги разговора
 * (прогноз, сводный «Хвост», дата покупки, возражения), блоки «Пять К».
 * После разворота подвопросов в блоке содержимого стало вдвое больше, и две
 * колонки в окне обычной ширины превращались в бесконечный скролл (владелец,
 * 02.09). В узком фрейме колонки складываются в одну.
 *
 * intensity="soft": в окне много полей с наведением, liquid-рефракция на
 * каждый mousemove здесь подтормаживала бы (см. GlassDialog JSDoc).
 *
 * Прогноз по компании стоит первым в итогах: после презентации цвет клиента
 * обязан быть выставлен осознанно — та же шкала, что в шапке, пишет в CRM
 * сразу.
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
            size="full"
            intensity="soft"
            cardClassName="gap-4 max-h-[94svh] overflow-y-auto"
        >
            <DialogHeader>
                <DialogTitle>Опросник после презентации</DialogTitle>
                <DialogDescription>
                    Хвост разговора, итоги — и «Пять К» по категориям.
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                <SurveyColumn title="Хвост">
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
                </SurveyColumn>

                <SurveyColumn title="Итоги разговора">
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
                    {view.outcomeItems.map(item => (
                        <CheckPresentationField
                            key={item.id}
                            item={item}
                            value={view.answers[item.id]}
                            isMissing={view.missingIds.includes(item.id)}
                            onChange={value => view.setAnswer(item.id, value)}
                            {...blockHandlers}
                        />
                    ))}
                </SurveyColumn>

                <SurveyColumn title="Пять К">
                    <CheckPresentationFiveK
                        items={view.fiveKItems}
                        answers={view.answers}
                        missingIds={view.missingIds}
                        onChange={view.setAnswer}
                        {...blockHandlers}
                    />
                </SurveyColumn>
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
