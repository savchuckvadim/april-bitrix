'use client';

import { FC } from 'react';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import {
    ContactBaseForm,
    ContactField,
} from '@/modules/entities/EventContact';
import { PbxContactFieldItem } from '@/modules/features/PbxContact';
import { CONTACT_SIDES } from '../../../lib/contact-sides';
import { useContactDialog } from '../../../lib/hooks/use-contact-dialog';
import { ContactWho } from './ContactWho';

/**
 * Развёрнутая карточка контакта: слева — кто это, справа — все его
 * характеристики.
 *
 * Сторону (отчёт или план) задаёт то место, откуда окно открыли, и внутри она
 * НЕ переключается. Переключатель тут был лишним: открывая контакт из плана,
 * менеджер работает с планом — предлагать ему тут же подменить контакт отчёта
 * значит звать к ошибке, которую потом никто не заметит.
 *
 * Характеристики — те же шкалы, что в миниатюре карточки, только с подписями
 * и селектами: править их удобнее в окне, где есть ширина, а мельком
 * смотреть — в миниатюре.
 */
export const ContactDetailsDialog: FC = () => {
    const dialog = useContactDialog();
    const side = CONTACT_SIDES.find(item => item.type === dialog.side);

    return (
        <GlassDialog
            open={dialog.isOpen}
            onOpenChange={isOpen => {
                if (!isOpen) dialog.close();
            }}
            size="lg"
            // Внутри окна девять шкал с наведением: liquid-стекло
            // перерисовывало SVG-фильтр на каждое движение мыши.
            intensity="soft"
            cardClassName="gap-3 max-h-[85vh] overflow-y-auto"
        >
            <DialogHeader>
                <DialogTitle>
                    {dialog.isView && dialog.details.name
                        ? `Контакт — ${dialog.details.name}`
                        : (side?.label ?? 'Контакт')}
                </DialogTitle>
                <DialogDescription>{side?.hint}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-[15rem_1fr]">
                <div className="flex min-w-0 flex-col gap-2">
                    {dialog.isView ? (
                        <p className="text-xs font-medium">
                            {dialog.details.name || 'не выбран'}
                        </p>
                    ) : (
                        <ContactField type={dialog.side} label={side?.label} />
                    )}

                    {dialog.hasContact && (
                        <ContactWho
                            details={dialog.details}
                            onAttachToDeal={
                                dialog.canAttachToDeal
                                    ? dialog.attachToDeal
                                    : undefined
                            }
                        />
                    )}

                    {/* Правка основных данных — там же, где правят
                        характеристики: раньше поменять телефон или должность
                        можно было только у только что созданного контакта. */}
                    {!dialog.isView && dialog.contactId !== null && (
                        <ContactBaseForm contactId={dialog.contactId} />
                    )}
                </div>

                <div className="min-w-0">
                    {!dialog.hasContact && (
                        <p className="text-xs text-muted-foreground">
                            Сначала выберите контакт — характеристики
                            заполняются у конкретного человека.
                        </p>
                    )}
                    {dialog.hasContact && !dialog.traits.length && (
                        <p className="text-xs text-muted-foreground">
                            У контакта нет заполняемых характеристик: на портале
                            не установлены поля ОРК.
                        </p>
                    )}
                    {dialog.contactId !== null && dialog.traits.length > 0 && (
                        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                            {dialog.traits.map(field => (
                                <PbxContactFieldItem
                                    key={field.bitrixId}
                                    contactId={dialog.contactId as number}
                                    field={field}
                                    readOnly={dialog.isView}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </GlassDialog>
    );
};
