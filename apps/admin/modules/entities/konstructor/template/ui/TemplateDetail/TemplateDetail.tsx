'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFields } from '@/modules/entities/konstructor/field';
import { useCounters } from '@/modules/entities/konstructor/counter';
import {
    FieldList,
    formatFieldValue,
    type FieldRow,
} from '@/modules/entities/konstructor/lib';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    useAttachTemplateField,
    useDeleteTemplate,
    useDetachTemplateField,
    useTemplate,
    useUpdateTemplate,
} from '../../lib/hooks';
import { TemplateForm } from '../TemplateForm';
import { TemplateFieldsManager } from './TemplateFieldsManager';
import { TemplateCountersManager } from './TemplateCountersManager';

/**
 * Детали шаблона конструктора портала: скалярные поля (с редактированием),
 * менеджер связанных полей (`template_field`) и менеджер связанных счётчиков
 * (`template_counter`) с pivot-данными.
 */
export function TemplateDetail({
    portalId,
    id,
}: {
    portalId: number;
    id: number;
}) {
    const router = useRouter();
    const template = useTemplate(id);
    const updateTemplate = useUpdateTemplate();
    const deleteTemplate = useDeleteTemplate();
    const attachField = useAttachTemplateField();
    const detachField = useDetachTemplateField();
    const allFields = useFields();
    const allCounters = useCounters();

    const [editing, setEditing] = React.useState(false);
    const [notice, setNotice] = React.useState<string | null>(null);

    const base = `/portal/${portalId}/konstructor/template`;
    const data = template.data;

    const rows: FieldRow[] = data
        ? [
              { label: 'ID', value: formatFieldValue(data.id) },
              { label: 'Название', value: formatFieldValue(data.name) },
              { label: 'Код', value: formatFieldValue(data.code) },
              { label: 'Тип', value: formatFieldValue(data.type) },
              { label: 'Ссылка', value: formatFieldValue(data.link) },
              { label: 'ID портала', value: formatFieldValue(data.portalId) },
          ]
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">
                        {data?.name || `Шаблон #${id}`}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Шаблон конструктора портала
                    </p>
                </div>
                <div className="flex gap-2">
                    {data && !editing && (
                        <Button variant="outline" onClick={() => setEditing(true)}>
                            Редактировать
                        </Button>
                    )}
                    {data && (
                        <Button
                            variant="destructive"
                            disabled={deleteTemplate.isPending}
                            onClick={() => {
                                setNotice(null);
                                deleteTemplate.mutate(id, {
                                    onSuccess: () => router.push(base),
                                    onError: (e) => setNotice(getApiErrorMessage(e)),
                                });
                            }}
                        >
                            Удалить
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <Link href={base}>← К списку</Link>
                    </Button>
                </div>
            </div>
            {notice && <p className="text-xs text-amber-600">{notice}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Шаблон</CardTitle>
                </CardHeader>
                <CardContent>
                    {template.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : !data ? (
                        <p className="text-sm text-muted-foreground">
                            Шаблон #{id} не найден.
                        </p>
                    ) : editing ? (
                        <TemplateForm
                            initial={data}
                            submitting={updateTemplate.isPending}
                            onCancel={() => setEditing(false)}
                            onSubmit={(values) => {
                                setNotice(null);
                                updateTemplate.mutate(
                                    { id, dto: values },
                                    {
                                        onSuccess: () => {
                                            setEditing(false);
                                            setNotice('Изменения сохранены.');
                                        },
                                        onError: (e) =>
                                            setNotice(getApiErrorMessage(e)),
                                    },
                                );
                            }}
                        />
                    ) : (
                        <FieldList rows={rows} />
                    )}
                </CardContent>
            </Card>

            {data && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Поля шаблона
                                <Badge variant="secondary">
                                    {data.fields?.length ?? 0}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TemplateFieldsManager
                                portalId={portalId}
                                attached={data.fields ?? []}
                                allFields={allFields.data ?? []}
                                attaching={attachField.isPending}
                                detaching={detachField.isPending}
                                onAttach={(fieldId) =>
                                    attachField.mutate(
                                        { id, fieldId },
                                        {
                                            onError: (e) =>
                                                setNotice(getApiErrorMessage(e)),
                                        },
                                    )
                                }
                                onDetach={(fieldId) =>
                                    detachField.mutate(
                                        { id, fieldId },
                                        {
                                            onError: (e) =>
                                                setNotice(getApiErrorMessage(e)),
                                        },
                                    )
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Счётчики шаблона
                                <Badge variant="secondary">
                                    {data.counters?.length ?? 0}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TemplateCountersManager
                                templateId={id}
                                attached={data.counters ?? []}
                                allCounters={allCounters.data ?? []}
                                onNotice={setNotice}
                            />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
