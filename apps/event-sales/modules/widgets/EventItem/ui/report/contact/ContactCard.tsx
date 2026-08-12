'use client';

import { FC, useState } from 'react';
import { ContactTraitsStrip } from '@/modules/features/PbxContact';
import { useContactCard } from '../../../lib/hooks/use-contact-card';
import { ContactActions } from './ContactActions';
import {
    ContactDetailsDialog,
    type ContactDialogMode,
} from './ContactDetailsDialog';
import { ContactIdentity } from './ContactIdentity';

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
 */
export const ContactCard: FC = () => {
    const [dialog, setDialog] = useState<ContactDialogMode | null>(null);
    const card = useContactCard();

    if (!card.isAvailable) return null;

    return (
        <div className="rounded-lg border border-border bg-card p-2.5">
            <div className="flex min-w-0 items-center gap-2">
                <ContactIdentity card={card} />
                <span className="ml-auto inline-flex shrink-0 items-center gap-0.5">
                    <ContactActions
                        hasContact={Boolean(card.report)}
                        onView={() => setDialog('view')}
                        onEdit={() => setDialog('edit')}
                    />
                </span>
            </div>

            {card.report && card.total > 0 && (
                <div className="mt-1.5 flex min-w-0 items-center gap-2">
                    {/* Клик по миниатюре — просмотр: смотрят чаще, чем правят. */}
                    <ContactTraitsStrip
                        fields={card.traits}
                        onOpen={() => setDialog('view')}
                        className="flex-1"
                    />
                    <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                        {card.filled}/{card.total}
                    </span>
                </div>
            )}

            <ContactDetailsDialog
                open={dialog !== null}
                onOpenChange={open => setDialog(open ? dialog : null)}
                mode={dialog ?? 'view'}
            />
        </div>
    );
};
