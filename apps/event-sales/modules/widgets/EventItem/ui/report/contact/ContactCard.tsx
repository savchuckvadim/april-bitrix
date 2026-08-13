'use client';

import { FC } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import {
    EV_CONTACT_TYPE,
    eventContactActions,
} from '@/modules/entities/EventContact';
import { ContactTraitsStrip } from '@/modules/features/PbxContact';
import { useContactCard } from '../../../lib/hooks/use-contact-card';
import { ContactActions } from './ContactActions';
import { ContactIdentity } from './ContactIdentity';
import { ContactRemoveAction } from './ContactRemoveAction';

/**
 * Контакт разговора одной строкой: кто это и каков он «на ощупь».
 *
 * Раньше здесь была анкета: комбобокс во всю ширину и под ним до девяти
 * характеристик по две строки каждая — рядом с пультом отчёта это опять
 * читалось как форма, а во фрейме-вкладке (630×600) просто не помещалось.
 *
 * Теперь: имя с должностью и миниатюра характеристик полосками — мельком
 * видно, где контакт силён и что не заполнено. Всё остальное (выбор другого
 * человека, контакт плана, правка значений) — в развёрнутой карточке.
 *
 * Самого окна здесь нет: карточка исчезает вместе с контактом, а окно должно
 * пережить это — им открывают выбор «с кем говорили». Оно смонтировано в
 * колонке отчёта.
 */
export const ContactCard: FC = () => {
    const dispatch = useAppDispatch();
    const card = useContactCard();

    // Контакта нет — карточки нет вовсе: добавить его предлагает иконка в
    // панели пульта (ReportToolsRail), а пустая карточка только занимала место.
    if (!card.report) return null;

    const open = (mode: 'view' | 'edit') =>
        dispatch(
            eventContactActions.openContactDialog({
                mode,
                side: EV_CONTACT_TYPE.REPORT,
            }),
        );

    return (
        <div className="rounded-lg border border-border bg-card p-2.5">
            <div className="flex min-w-0 items-center gap-2">
                <ContactIdentity card={card} />
                <span className="ml-auto inline-flex shrink-0 items-center gap-0.5">
                    <ContactActions
                        hasContact
                        onView={() => open('view')}
                        onEdit={() => open('edit')}
                    />
                    <ContactRemoveAction />
                </span>
            </div>

            {card.total > 0 && (
                <div className="mt-1.5 flex min-w-0 items-center gap-2">
                    {/* Клик по миниатюре — просмотр: смотрят чаще, чем правят. */}
                    <ContactTraitsStrip
                        fields={card.traits}
                        onOpen={() => open('view')}
                        className="flex-1"
                    />
                    <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                        {card.filled}/{card.total}
                    </span>
                </div>
            )}
        </div>
    );
};
