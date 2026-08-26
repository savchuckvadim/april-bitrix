'use client';

import { FC } from 'react';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { PurchaseSignalsCard } from '@/modules/features/PurchaseSignals';
import { InnControl } from '@/modules/features/Inn';
import { SignalsControl } from '@/modules/features/ClientSignals';
import { XvostFieldsCard } from '@/modules/features/XvostFields';

/**
 * «Поля сущности» — модалка со всеми ОБЩИМИ ручными pbx-полями клиента
 * (todo2508 №6): даты покупки и конкурентов, ИНН, точки связи, плюс
 * хвост-поля сделки. Открывается кнопкой в правом углу шапки — доступна и
 * на узких экранах, где карточки этих полей скрыты.
 *
 * Состав — реюз готовых карточек (никакого дублирования форм): каждая
 * самогейтится по слепку портала и молчит, если поля не установлены.
 * «Хвост» (op_xvost_*) — deal-only и штатно пишется опросником после
 * презентации: ручная карточка здесь — для исключений, и только в модалке
 * (своей секции на экране у неё нет).
 */
export const EntityFieldsDialog: FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => (
    <GlassDialog
        open={open}
        onOpenChange={onOpenChange}
        size="md"
        intensity="soft"
        cardClassName="gap-3 max-h-[85vh]"
    >
        <DialogHeader>
            <DialogTitle>Поля сущности</DialogTitle>
            <DialogDescription>
                Общие ручные поля клиента — те же, что в карточках экрана.
            </DialogDescription>
        </DialogHeader>

        {/* Четыре карточки могут не влезть в невысокий фрейм — скроллим
            содержимое, шапка остаётся на месте. */}
        <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
            <InnControl />
            <SignalsControl />
            <PurchaseSignalsCard />
            <XvostFieldsCard />
        </div>
    </GlassDialog>
);
