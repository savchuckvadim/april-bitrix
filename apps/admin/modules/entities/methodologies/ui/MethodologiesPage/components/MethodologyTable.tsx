'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { METHODOLOGIES_TEXT, SCOPE_LABELS, type MethodologyItem } from '../../../model';
import { formatUpdated } from '../../../lib/methodology-form.state';
import { itemStateLabel } from '../../../lib/methodology-form.util';

interface MethodologyTableProps {
    items: MethodologyItem[] | undefined;
    loading: boolean;
    onOpen: (item: MethodologyItem) => void;
    onCopy: (item: MethodologyItem) => void;
}

const STATE_TEXTS = {
    builtin: METHODOLOGIES_TEXT.builtin,
    inactive: METHODOLOGIES_TEXT.inactive,
    invalid: METHODOLOGIES_TEXT.invalid,
};

/** Таблица методик: общий слой и, при выбранном портале, его свои методики. */
export const MethodologyTable = ({ items, loading, onOpen, onCopy }: MethodologyTableProps) => {
    const texts = METHODOLOGIES_TEXT;
    if (loading) {
        return <p className="text-sm text-muted-foreground">{texts.loading}</p>;
    }
    if (!items || items.length === 0) {
        return <p className="text-sm text-muted-foreground">{texts.empty}</p>;
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{texts.columns.title}</TableHead>
                    <TableHead>{texts.columns.scope}</TableHead>
                    <TableHead>{texts.columns.version}</TableHead>
                    <TableHead className="text-right">{texts.columns.checkpoints}</TableHead>
                    <TableHead className="text-right">{texts.columns.caps}</TableHead>
                    <TableHead>{texts.columns.state}</TableHead>
                    <TableHead>{texts.columns.updated}</TableHead>
                    <TableHead className="text-right">{texts.columns.actions}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item.id ?? `builtin:${item.code}`}>
                        <TableCell>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.code}</div>
                        </TableCell>
                        <TableCell>
                            <div>{SCOPE_LABELS[item.scope]}</div>
                            {item.portalDomain && (
                                <div className="text-xs text-muted-foreground">{item.portalDomain}</div>
                            )}
                        </TableCell>
                        <TableCell>{item.version}</TableCell>
                        <TableCell className="text-right">{item.checkpoints}</TableCell>
                        <TableCell className="text-right">{item.caps}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {itemStateLabel(item, STATE_TEXTS).map(label => (
                                    <Badge
                                        key={label}
                                        variant={label === texts.invalid ? 'destructive' : 'secondary'}
                                    >
                                        {label}
                                    </Badge>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                            {formatUpdated(item.updatedAt, item.updatedBy)}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button size="sm" variant="outline" onClick={() => onOpen(item)}>
                                    {texts.open}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => onCopy(item)}>
                                    {texts.copy}
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
