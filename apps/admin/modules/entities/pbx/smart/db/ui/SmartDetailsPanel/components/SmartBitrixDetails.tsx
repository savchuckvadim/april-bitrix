'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import { Badge } from '@workspace/ui/components/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import type {
    SmartBitrixState,
    SmartCategory,
    SmartDetailsField,
} from '../../../model';

/** Значения enum-поля: `value` + xmlId; для остальных типов — «—». */
function FieldItemsCell({ field }: { field: SmartDetailsField }) {
    if (!field.items?.length) {
        return <span className="text-muted-foreground">—</span>;
    }
    return (
        <ul className="space-y-0.5">
            {field.items.map((item) => (
                <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-1"
                >
                    <span>{item.value}</span>
                    {item.xmlId && (
                        <span className="font-mono text-muted-foreground">
                            ({item.xmlId})
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

/** Таблица UF-полей смарта. */
function FieldsTable({ fields }: { fields: SmartDetailsField[] }) {
    if (fields.length === 0) {
        return <p className="text-muted-foreground">UF-полей у смарта нет.</p>;
    }
    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-64">UF-имя</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead className="w-32">Тип</TableHead>
                        <TableHead className="w-20 text-center">
                            Множ.
                        </TableHead>
                        <TableHead>Значения</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.map((field) => (
                        <TableRow key={field.fieldName}>
                            <TableCell className="font-mono text-xs">
                                <div>{field.fieldName}</div>
                                {field.xmlId && (
                                    <div className="text-muted-foreground">
                                        xmlId: {field.xmlId}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>{field.title}</TableCell>
                            <TableCell className="font-mono text-xs">
                                {field.type}
                            </TableCell>
                            <TableCell className="text-center">
                                {field.multiple ? 'Да' : '—'}
                            </TableCell>
                            <TableCell>
                                <FieldItemsCell field={field} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

/** Воронки смарта: каждая раскрывается списком стадий (name + statusId). */
function CategoriesList({ categories }: { categories: SmartCategory[] }) {
    if (categories.length === 0) {
        return <p className="text-muted-foreground">Воронок у смарта нет.</p>;
    }
    return (
        <Accordion type="multiple" className="rounded-md border px-3">
            {categories.map((category) => (
                <AccordionItem key={category.id} value={String(category.id)}>
                    <AccordionTrigger className="text-xs">
                        <span className="flex flex-wrap items-center gap-2">
                            {category.name}
                            <span className="font-mono text-muted-foreground">
                                id: {category.id} · стадий:{' '}
                                {category.stages.length}
                            </span>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent>
                        {category.stages.length === 0 ? (
                            <p className="text-muted-foreground">
                                Стадий в воронке нет.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Стадия</TableHead>
                                        <TableHead className="w-64">
                                            STATUS_ID
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {category.stages.map((stage) => (
                                        <TableRow key={stage.statusId}>
                                            <TableCell>{stage.name}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {stage.statusId}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

/** Живое состояние смарта в Bitrix: шапка типа + вкладки полей и воронок. */
export function SmartBitrixDetails({ bitrix }: { bitrix: SmartBitrixState }) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{bitrix.title}</span>
                <Badge variant="outline" className="font-mono">
                    entityTypeId: {bitrix.entityTypeId}
                </Badge>
                <Badge variant="outline" className="font-mono">
                    code: {bitrix.code}
                </Badge>
            </div>

            <Tabs defaultValue="fields">
                <TabsList>
                    <TabsTrigger value="fields">
                        Поля ({bitrix.fields.length})
                    </TabsTrigger>
                    <TabsTrigger value="categories">
                        Воронки и стадии ({bitrix.categories.length})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="fields">
                    <FieldsTable fields={bitrix.fields} />
                </TabsContent>
                <TabsContent value="categories">
                    <CategoriesList categories={bitrix.categories} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
