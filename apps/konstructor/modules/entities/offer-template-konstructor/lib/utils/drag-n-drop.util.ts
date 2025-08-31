import { DragEndEvent } from '@dnd-kit/core';
import { findPageByBlockId } from './block.util';
import { AppDispatch } from '@/modules/app';

import {
    addNewPage,
    updateDifferentPages,
    updateIdenticalPages,
} from '../state-utils/page.state.util';
import {
    IOfferTemplate,
    IOfferTemplatePage,
} from '@/modules/entities/offer-template/type/offer-template.type';

export const handleDragEnd = (
    event: DragEndEvent,
    current: IOfferTemplate | null,
    dispatch: AppDispatch,
) => {
    if (!current) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourcePage = findPageByBlockId(current, activeId);
    if (!sourcePage) return;

    if (event.over?.id === 'new-page-zone') {
        // Добавь новую страницу
        addNewPage(dispatch, sourcePage, activeId);

        return;
    }

    let targetPage: IOfferTemplatePage | undefined;
    let insertBeforeBlockId: string | null = null;

    if (overId.startsWith('page-')) {
        // Drop на всю страницу — значит вставляем в конец
        const pageId = overId.replace('page-', '');
        targetPage = current.pages.find(p => p.id === pageId);
    } else {
        // Drop на конкретный блок

        targetPage = findPageByBlockId(current, overId);
        insertBeforeBlockId = overId;
    }

    if (!targetPage) return;

    if (sourcePage.id === targetPage.id) {
        updateIdenticalPages(
            dispatch,
            sourcePage,
            activeId,
            insertBeforeBlockId,
        );
    } else {
        updateDifferentPages(
            dispatch,
            sourcePage,
            targetPage,
            activeId,
            insertBeforeBlockId,
        );
    }
};

// export const handleDragEnd = (
//     event: DragEndEvent, current: OfferPdfSetting,
//     dispatch: AppDispatch
// ) => {

//     const { active, over } = event;
//
//     if (!over || active.id === over.id) return;

//     const sourcePage = findPageByBlockId(current, active.id as string);
//     const targetPage = findPageByBlockId(current, over.id as string);
//     if (!sourcePage || !targetPage) return;

//     if (sourcePage.id === targetPage.id) {
//         updateIdenticalPages(
//             dispatch,
//             sourcePage,
//             active.id as string,
//             over.id as string
//         )
//         return;
//     }

//     updateDifferentPages(
//         dispatch,
//         sourcePage,
//         targetPage,
//         active.id as string,
//         over.id as string
//     )

// };
