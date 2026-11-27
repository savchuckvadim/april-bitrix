'use client';

import { BxRqEditModal } from './BxRqEditModal';
import { useDraftModals } from '../lib/hooks/use-draft-modals';

/**
 * Окна правки реквизита на уровне экрана реквизитов, вне вкладок: новый
 * реквизит, основные поля, адрес, банк. Открываются поверх любой вкладки.
 */
export const BxRqDraftModals = () => {
    const modals = useDraftModals();

    return (
        <>
            {modals.base ? <BxRqEditModal {...modals.base} /> : null}
            {modals.address ? <BxRqEditModal {...modals.address} /> : null}
            {modals.bank ? <BxRqEditModal {...modals.bank} /> : null}
        </>
    );
};
