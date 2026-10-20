'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { HintTooltip } from '@workspace/april-ui';
import type { AiStyleAxis } from '@/modules/entities/ai-analytics';
import { AI_STYLE_AXES_TEXT } from '../../lib/ai-style.util';
import { AiStyleAxisRow } from './AiStyleAxisRow';

interface AiStyleAxesTableProps {
    axes: AiStyleAxis[];
    /** Класс заголовка раздела (как у соседних разделов карточки). */
    titleClassName: string;
}

const T = AI_STYLE_AXES_TEXT;

/** Таблица осей стиля: черта, два края, положение, отклонение, звонков, доверие. */
export const AiStyleAxesTable = ({ axes, titleClassName }: AiStyleAxesTableProps) => (
    <section>
        <HintTooltip title={T.hint.title} lines={[...T.hint.lines]}>
            <h4 className={`${titleClassName} w-fit cursor-help border-b border-dashed`}>
                {T.title}
            </h4>
        </HintTooltip>
        <Table className="mt-1">
            <TableHeader>
                <TableRow>
                    <TableHead>{T.columns.axis}</TableHead>
                    <TableHead className="text-right">{T.columns.minus}</TableHead>
                    <TableHead>{T.columns.scale}</TableHead>
                    <TableHead>{T.columns.plus}</TableHead>
                    <TableHead className="text-right">{T.columns.deviation}</TableHead>
                    <TableHead className="text-right">{T.columns.n}</TableHead>
                    <TableHead>{T.columns.confidence}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {axes.map(axis => (
                    <AiStyleAxisRow key={axis.code} axis={axis} />
                ))}
            </TableBody>
        </Table>
    </section>
);
