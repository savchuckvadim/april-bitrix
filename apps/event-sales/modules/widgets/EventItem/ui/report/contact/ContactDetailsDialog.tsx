'use client';

import { FC, useState } from 'react';
import { MicroSegmented } from '@workspace/april-ui';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import {
    ContactField,
    EV_CONTACT_TYPE,
    eventContactActions,
} from '@/modules/entities/EventContact';
import { PbxContactFieldItem } from '@/modules/features/PbxContact';
import {
    useContactCard,
    useContactDetails,
    useContactTraits,
} from '../../../lib/hooks/use-contact-card';
import { ContactWho } from './ContactWho';

export type ContactDialogMode = 'view' | 'edit';

interface ContactDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /**
     * Просмотр или правка. Смотрят чаще, чем правят, и в просмотре нет ни
     * одного поля ввода — можно листать характеристики, ничего не задев.
     */
    mode?: ContactDialogMode;
}

const SIDES: Array<{ type: EV_CONTACT_TYPE; label: string; hint: string }> = [
    {
        type: EV_CONTACT_TYPE.REPORT,
        label: 'С кем говорили',
        hint: 'Контакт этого разговора — попадёт в отчёт и в историю общения.',
    },
    {
        type: EV_CONTACT_TYPE.PLAN,
        label: 'Кому следующий шаг',
        hint: 'Контакт запланированного события — в нём может быть уже другой человек.',
    },
];

/**
 * Развёрнутая карточка контакта: слева — кто это, справа — все его
 * характеристики.
 *
 * Контактов в форме два (с кем говорили и кому планируем следующий шаг), и
 * выбираются они из одного и того же списка — поэтому здесь переключатель, а
 * не две независимые формы: человек чаще всего один, а расхождение видно
 * сразу.
 *
 * Характеристики — те же шкалы, что в миниатюре карточки, только с подписями
 * и селектами: править их удобнее в окне, где есть ширина, а мельком смотреть —
 * в миниатюре.
 */
export const ContactDetailsDialog: FC<ContactDetailsDialogProps> = ({
    open,
    onOpenChange,
    mode = 'edit',
}) => {
    const dispatch = useAppDispatch();
    const [side, setSide] = useState<EV_CONTACT_TYPE>(EV_CONTACT_TYPE.REPORT);
    const card = useContactCard();

    const isView = mode === 'view';
    const contact = side === EV_CONTACT_TYPE.REPORT ? card.report : card.plan;
    const details = useContactDetails(contact);
    const traits = useContactTraits(contact);
    const activeSide = SIDES.find(item => item.type === side);

    /** «Тот же человек» — частый случай, не заставляем искать его повторно. */
    const copyFromReport = () => {
        if (!card.report) return;
        dispatch(
            eventContactActions.setCurrentContact({
                type: EV_CONTACT_TYPE.PLAN,
                contactId: Number(card.report.ID),
            }),
        );
    };

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="lg"
            cardClassName="gap-3 max-h-[85vh] overflow-y-auto"
        >
            <DialogHeader>
                <DialogTitle>
                    {isView && details.name
                        ? `Контакт — ${details.name}`
                        : 'Контакт'}
                </DialogTitle>
                <DialogDescription>{activeSide?.hint}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-[15rem_1fr]">
                <div className="flex min-w-0 flex-col gap-2">
                    <MicroSegmented
                        ariaLabel="Контакт отчёта или плана"
                        size="xs"
                        stretch
                        value={side}
                        options={SIDES.map(item => ({
                            value: item.type,
                            label: item.label,
                        }))}
                        onChange={value => setSide(value as EV_CONTACT_TYPE)}
                    />

                    {isView ? (
                        <p className="text-xs font-medium">
                            {details.name || 'не выбран'}
                        </p>
                    ) : (
                        <ContactField type={side} label={activeSide?.label} />
                    )}

                    {!isView &&
                        side === EV_CONTACT_TYPE.PLAN &&
                        card.planName && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 justify-start px-1 text-xs"
                                onClick={copyFromReport}
                            >
                                Тот же, что в отчёте — {card.name}
                            </Button>
                        )}

                    {contact && <ContactWho details={details} />}
                </div>

                <div className="min-w-0">
                    {!contact && (
                        <p className="text-xs text-muted-foreground">
                            Сначала выберите контакт — характеристики
                            заполняются у конкретного человека.
                        </p>
                    )}
                    {contact && !traits.length && (
                        <p className="text-xs text-muted-foreground">
                            У контакта нет заполняемых характеристик: на портале
                            не установлены поля ОРК.
                        </p>
                    )}
                    {contact && traits.length > 0 && (
                        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                            {traits.map(field => (
                                <PbxContactFieldItem
                                    key={field.bitrixId}
                                    contactId={Number(contact.ID)}
                                    field={field}
                                    readOnly={isView}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </GlassDialog>
    );
};
