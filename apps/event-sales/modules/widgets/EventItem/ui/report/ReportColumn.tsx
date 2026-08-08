'use client';

import { FC, ReactNode } from 'react';
import type { ItemVisibility } from '../../lib/item-visibility';
import { ReportSection } from '../sections/ReportSection';
import { NoresultSection } from '../sections/NoresultSection';
import { SaleSection } from '../sections/SaleSection';
import { PostFailSection } from '../sections/PostFailSection';
import { CommentSection } from '../sections/CommentSection';
import { ReportContactCard } from './ReportContactCard';

interface ReportColumnProps {
    visibility: ItemVisibility;
    /** Записи звонков — идут НАД комментарием. */
    records?: ReactNode;
}

/**
 * Левая колонка — всё, ПО ЧЕМУ отчитываемся.
 *
 * Порядок намеренный: сначала итог разговора (статусы), затем звонки —
 * их слушают, чтобы вспомнить детали, — и только потом большой комментарий,
 * который пишут по итогу. Комментарий последний и самый крупный: это главный
 * рабочий инструмент, он не должен делить высоту ни с чем.
 */
export const ReportColumn: FC<ReportColumnProps> = ({ visibility, records }) => (
    <div className="space-y-3">
        {records}

        <div className='w-full'>
            <div className='w-4/5'>
                <CommentSection />
            </div>
            <div className='w-1/5'>
                <div>
                    {visibility.noresult && <NoresultSection />}
                    {visibility.sale && <SaleSection />}
                    {visibility.postFail && <PostFailSection />}
                </div>
            </div>
        </div>
        <ReportSection />
        {/* {visibility.noresult && <NoresultSection />}
        {visibility.sale && <SaleSection />}
        {visibility.postFail && <PostFailSection />} */}

        <ReportContactCard />

    </div>
);
