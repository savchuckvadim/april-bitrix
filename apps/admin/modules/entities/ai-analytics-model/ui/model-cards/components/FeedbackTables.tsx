'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { FEEDBACK_TEXT } from '../../../consts/ai-analytics-model.const';
import type {
    FeedbackKindRow,
    FeedbackManagerRow,
} from '../../../lib/feedback-view.util';
import { CodeLabel } from '../shared/CodeLabel';

const NUM = 'text-right tabular-nums';

/** Разрез обратной связи по видам записей. */
export const FeedbackKindsTable = ({ kinds }: { kinds: FeedbackKindRow[] }) => (
    <div className="space-y-2">
        <h4 className="text-sm font-medium">{FEEDBACK_TEXT.kindsTitle}</h4>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{FEEDBACK_TEXT.kind}</TableHead>
                        <TableHead className="text-right">{FEEDBACK_TEXT.count}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {kinds.map(kind => (
                        <TableRow key={kind.code}>
                            <TableCell>
                                <CodeLabel view={kind} />
                            </TableCell>
                            <TableCell className={NUM}>{kind.count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
);

/** Разрез обратной связи по менеджерам: реакции витрины и прочее. */
export const FeedbackManagersTable = ({
    managers,
}: {
    managers: FeedbackManagerRow[];
}) => (
    <div className="space-y-2">
        <h4 className="text-sm font-medium">{FEEDBACK_TEXT.managersTitle}</h4>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{FEEDBACK_TEXT.manager}</TableHead>
                        <TableHead className="text-right">{FEEDBACK_TEXT.total}</TableHead>
                        <TableHead className="text-right">{FEEDBACK_TEXT.useful}</TableHead>
                        <TableHead className="text-right">{FEEDBACK_TEXT.notUseful}</TableHead>
                        <TableHead className="text-right">{FEEDBACK_TEXT.disagree}</TableHead>
                        <TableHead className="text-right">{FEEDBACK_TEXT.other}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {managers.map(row => (
                        <TableRow key={row.key}>
                            <TableCell>{row.manager}</TableCell>
                            <TableCell className={NUM}>{row.total}</TableCell>
                            <TableCell className={NUM}>{row.useful}</TableCell>
                            <TableCell className={NUM}>{row.notUseful}</TableCell>
                            <TableCell className={NUM}>{row.disagree}</TableCell>
                            <TableCell className={NUM}>{row.other}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
);
