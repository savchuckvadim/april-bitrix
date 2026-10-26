'use client';

import { FC, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';
import { useTransferWork } from '../lib/hooks/use-transfer-work';
import { TransferWorkDialog } from './TransferWorkDialog';

/**
 * «Передать работу» в шапке — доступна всем (просьба клиента): выбрать
 * коллегу и передать ему работу по клиенту. В контексте лида передавать
 * нечего — кнопки нет.
 */
export const TransferWorkButton: FC = () => {
    const [open, setOpen] = useState(false);
    const view = useTransferWork();
    if (!view.isAvailable) return null;

    const openDialog = () => {
        view.reset();
        setOpen(true);
    };

    return (
        <>
            <IconAction
                icon={ArrowRightLeft}
                label={view.text.button}
                hint="Сделки, компания, контакты и задачи клиента — другому сотруднику"
                side="bottom"
                align="end"
                onClick={openDialog}
            />
            <TransferWorkDialog
                open={open}
                onOpenChange={setOpen}
                view={view}
            />
        </>
    );
};
