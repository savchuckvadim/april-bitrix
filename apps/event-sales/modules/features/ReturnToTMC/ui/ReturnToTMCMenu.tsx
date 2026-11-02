'use client';

import { FC } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { MicroField, MicroSelect } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_REPORT_PROP,
    EventReportSelectProp,
    eventReportActions,
    WorkStatusSegments,
} from '@/modules/entities/EventReport';
import { ClientBar } from '@/modules/entities/EventCompany';
import { getReturnToTMCMenu, sendReturnToTmc } from '../model/ReturnToTMCThunk';

/**
 * Меню «Возврат в ТМ» — как в легаси: цвет и статус клиента, статус работы
 * (по умолчанию «Отказ»), тип и причина отказа, причина нерезультативности
 * и обязательный комментарий. Отправка — общий flow отчёта с `returnToTmc`:
 * сделки ОП закрываются отказом, компания и задача уходят ТМЦ-менеджеру.
 */
export const ReturnToTMCMenu: FC = () => {
    const dispatch = useAppDispatch();
    const isActive = useAppSelector(s => s.returnToTmc.menu.isActive);
    const report = useAppSelector(s => s.eventReport.report);
    const commentError = useAppSelector(
        s => s.event.errors.current.comment,
    );

    const setProp = (propName: EventReportSelectProp) => (value: string) =>
        dispatch(eventReportActions.setReportProp({ propName, value }));

    const noresultReason = report[EV_REPORT_PROP.NORESULT_REASON];
    const failType = report[EV_REPORT_PROP.FAIL_TYPE];
    const failReason = report[EV_REPORT_PROP.FAIL_REASON];
    const comment = report[EV_REPORT_PROP.COMMENT];

    const close = () => dispatch(getReturnToTMCMenu(null, false));

    return (
        <Dialog open={isActive} onOpenChange={open => !open && close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Возврат в ТМ</DialogTitle>
                    <DialogDescription>
                        Клиент вернётся ТМЦ-менеджеру: сделки отдела продаж
                        закроются отказом, компания и задача перейдут к нему.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <ClientBar />

                    <MicroField label="Статус">
                        <WorkStatusSegments />
                    </MicroField>

                    <div className="flex flex-wrap gap-x-3 gap-y-2">
                        {failType.isActive && (
                            <MicroField label="Тип отказа" required>
                                <MicroSelect
                                    ariaLabel="Тип отказа"
                                    value={String(failType.current.id)}
                                    options={failType.items.map(item => ({
                                        value: String(item.id),
                                        label: item.name,
                                    }))}
                                    onChange={setProp(EV_REPORT_PROP.FAIL_TYPE)}
                                    className="w-44"
                                />
                            </MicroField>
                        )}
                        {failReason.isActive && (
                            <MicroField label="Причина отказа" required>
                                <MicroSelect
                                    ariaLabel="Причина отказа"
                                    value={String(failReason.current.id)}
                                    options={failReason.items.map(item => ({
                                        value: String(item.id),
                                        label: item.name,
                                    }))}
                                    onChange={setProp(EV_REPORT_PROP.FAIL_REASON)}
                                    className="w-44"
                                />
                            </MicroField>
                        )}
                    </div>

                    <MicroField label="Причина нерезультативности">
                        <MicroSelect
                            ariaLabel="Причина нерезультативности"
                            value={String(noresultReason.current.id)}
                            options={noresultReason.items.map(item => ({
                                value: String(item.id),
                                label: item.name,
                            }))}
                            onChange={setProp(EV_REPORT_PROP.NORESULT_REASON)}
                            className="w-full"
                        />
                    </MicroField>

                    <div className="space-y-1">
                        <Textarea
                            value={comment}
                            rows={3}
                            placeholder="Почему возвращаем? Комментарий обязателен"
                            aria-invalid={Boolean(commentError)}
                            onChange={e =>
                                dispatch(
                                    eventReportActions.setReportProp({
                                        propName: EV_REPORT_PROP.COMMENT,
                                        value: e.target.value,
                                    }),
                                )
                            }
                        />
                        {commentError && (
                            <p className="text-sm text-destructive">
                                {commentError}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={close}>
                            Отмена
                        </Button>
                        <Button onClick={() => dispatch(sendReturnToTmc())}>
                            Вернуть в ТМ
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
