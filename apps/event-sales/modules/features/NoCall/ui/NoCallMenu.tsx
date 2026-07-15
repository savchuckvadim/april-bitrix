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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_REPORT_PROP,
    eventReportActions,
} from '@/modules/entities/EventReport';
import { getNoCallMenu, sendNoCall } from '../model/NoCallThunk';

/** Меню недозвона: причина + комментарий + отправка (isNoCall-flow). */
export const NoCallMenu: FC = () => {
    const dispatch = useAppDispatch();
    const isActive = useAppSelector(s => s.noCall.menu.isActive);
    const noresultReason = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.NORESULT_REASON],
    );
    const comment = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.COMMENT],
    );

    const close = () => dispatch(getNoCallMenu(null, false));

    return (
        <Dialog open={isActive} onOpenChange={open => !open && close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Недозвон</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <Select
                        value={String(noresultReason.current.id)}
                        onValueChange={value =>
                            dispatch(
                                eventReportActions.setReportProp({
                                    propName: EV_REPORT_PROP.NORESULT_REASON,
                                    value,
                                }),
                            )
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {noresultReason.items.map(item => (
                                <SelectItem key={item.id} value={String(item.id)}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Textarea
                        value={comment}
                        rows={3}
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
                        <Button onClick={() => dispatch(sendNoCall())}>
                            Отправить
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
