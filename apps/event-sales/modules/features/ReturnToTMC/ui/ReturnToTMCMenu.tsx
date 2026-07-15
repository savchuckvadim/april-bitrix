'use client';

import { FC } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_REPORT_PROP,
    eventReportActions,
} from '@/modules/entities/EventReport';
import { getReturnToTMCMenu, sendReturnToTmc } from '../model/ReturnToTMCThunk';

/** Меню возврата презентации в ТМЦ: комментарий обязателен, отправка — общий flow. */
export const ReturnToTMCMenu: FC = () => {
    const dispatch = useAppDispatch();
    const isActive = useAppSelector(s => s.returnToTmc.menu.isActive);
    const comment = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.COMMENT],
    );

    const close = () => dispatch(getReturnToTMCMenu(null, false));

    return (
        <Dialog open={isActive} onOpenChange={open => !open && close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Вернуть в ТМЦ</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <Textarea
                        value={comment}
                        rows={3}
                        placeholder="Почему возвращаем?"
                        onChange={e =>
                            dispatch(
                                eventReportActions.setReportProp({
                                    propName: EV_REPORT_PROP.COMMENT,
                                    value: e.target.value,
                                }),
                            )
                        }
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={close}>
                            Отмена
                        </Button>
                        <Button onClick={() => dispatch(sendReturnToTmc())}>
                            Отправить
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
