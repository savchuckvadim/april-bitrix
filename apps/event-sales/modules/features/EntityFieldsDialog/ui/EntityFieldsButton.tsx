'use client';

import { FC, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { IconAction } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EntityFieldsDialog } from './EntityFieldsDialog';

/**
 * Кнопка «Поля сущности» в действиях шапки: модалка с общими ручными
 * pbx-полями клиента. Прячется, пока сущность не определена — полям не к
 * кому резолвиться.
 */
export const EntityFieldsButton: FC = () => {
    const [open, setOpen] = useState(false);
    const hasEntity = useAppSelector(s =>
        Boolean(s.app.bitrix.company || s.app.bitrix.deal || s.app.bitrix.lead),
    );
    if (!hasEntity) return null;

    return (
        <>
            <IconAction
                icon={SlidersHorizontal}
                label="Поля сущности"
                hint="Даты покупки, конкуренты, ИНН и другие ручные поля клиента"
                side="bottom"
                align="end"
                onClick={() => setOpen(true)}
            />
            <EntityFieldsDialog open={open} onOpenChange={setOpen} />
        </>
    );
};
