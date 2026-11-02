'use client';

import { FC, useEffect, useRef, useState } from 'react';
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
    eventReportActions,
} from '@/modules/entities/EventReport';
import { ContactField, EV_CONTACT_TYPE } from '@/modules/entities/EventContact';
import { getNoCallMenu, sendNoCall } from '../model/NoCallThunk';
import {
    appendCommentLine,
    companyPhoneOptions,
    contactDisplayName,
    withContactName,
} from '../lib/no-call-comment.util';

/**
 * Меню недозвона — как в легаси: причина нерезультативности, контакт (с кем
 * не получилось пообщаться), номер, на который не дозвонились, комментарий.
 *
 * Хитрость комментария тоже легаси: выбранный номер дописывается в текст
 * новой строкой, имя контакта дописывается/заменяется/убирается вслед за
 * выбором — в истории клиента видно, кому и куда звонили.
 */
export const NoCallMenu: FC = () => {
    const dispatch = useAppDispatch();
    const isActive = useAppSelector(s => s.noCall.menu.isActive);
    const noresultReason = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.NORESULT_REASON],
    );
    const comment = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.COMMENT],
    );
    const reportContact = useAppSelector(s => s.contact.current.report);
    const phones = useAppSelector(s =>
        companyPhoneOptions(
            (s.app.bitrix.company as { PHONE?: unknown } | null)?.PHONE,
        ),
    );
    const [phoneId, setPhoneId] = useState<string | undefined>(undefined);

    const setComment = (value: string) =>
        dispatch(
            eventReportActions.setReportProp({
                propName: EV_REPORT_PROP.COMMENT,
                value,
            }),
        );

    // Имя контакта в комментарии следует за выбором: сменили — заменили,
    // сняли — убрали. Прежнее имя помним сами: в стейте его уже нет.
    const contactName = contactDisplayName(reportContact);
    const previousName = useRef<string | null>(null);
    useEffect(() => {
        if (!isActive) {
            previousName.current = null;
            setPhoneId(undefined);
            return;
        }
        if (previousName.current === contactName) return;
        const next = withContactName(comment, previousName.current, contactName);
        previousName.current = contactName;
        if (next !== comment) setComment(next);
        // Комментарий намеренно не в зависимостях: реагируем на контакт.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, contactName]);

    const pickPhone = (id: string) => {
        setPhoneId(id);
        const phone = phones.find(item => item.id === id);
        if (phone) setComment(appendCommentLine(comment, phone.value));
    };

    const close = () => dispatch(getNoCallMenu(null, false));

    return (
        <Dialog open={isActive} onOpenChange={open => !open && close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Нерезультативный звонок</DialogTitle>
                    <DialogDescription>
                        Недозвон запишется в историю клиента без разговора.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <MicroField label="Причина" required>
                        <MicroSelect
                            ariaLabel="Причина нерезультативности"
                            value={String(noresultReason.current.id)}
                            options={noresultReason.items.map(item => ({
                                value: String(item.id),
                                label: item.name,
                            }))}
                            onChange={value =>
                                dispatch(
                                    eventReportActions.setReportProp({
                                        propName: EV_REPORT_PROP.NORESULT_REASON,
                                        value,
                                    }),
                                )
                            }
                            className="w-full"
                        />
                    </MicroField>

                    <ContactField type={EV_CONTACT_TYPE.REPORT} />

                    {phones.length > 0 && (
                        <MicroField label="На какой номер недозвон">
                            <MicroSelect
                                ariaLabel="Номер, на который не дозвонились"
                                value={phoneId}
                                placeholder="Выберите номер"
                                options={phones.map(phone => ({
                                    value: phone.id,
                                    label: phone.value,
                                }))}
                                onChange={pickPhone}
                                className="w-full"
                            />
                        </MicroField>
                    )}

                    <Textarea
                        value={comment}
                        rows={4}
                        placeholder="Опишите кратко, что было"
                        onChange={e => setComment(e.target.value)}
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
