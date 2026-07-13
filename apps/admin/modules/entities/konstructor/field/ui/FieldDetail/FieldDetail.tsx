'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FieldList,
    formatFieldValue,
    type FieldRow,
} from '@/modules/entities/konstructor/lib';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { useDeleteField, useField, useUpdateField } from '../../lib/hooks';
import { FieldForm } from '../FieldForm';

/**
 * Детали поля конструктора: все поля справочника `fields` с возможностью
 * редактирования и удаления. `portalId` — для возврата в раздел конструктора портала.
 */
export function FieldDetail({
    portalId,
    id,
}: {
    portalId: number;
    id: number;
}) {
    const router = useRouter();
    const field = useField(id);
    const updateField = useUpdateField();
    const deleteField = useDeleteField();

    const [editing, setEditing] = React.useState(false);
    const [notice, setNotice] = React.useState<string | null>(null);

    const base = `/portal/${portalId}/konstructor/field`;
    const data = field.data;

    const rows: FieldRow[] = data
        ? [
              { label: 'ID', value: formatFieldValue(data.id) },
              { label: 'Порядковый номер', value: formatFieldValue(data.number) },
              { label: 'Название', value: formatFieldValue(data.name) },
              { label: 'Код', value: formatFieldValue(data.code) },
              { label: 'Тип', value: formatFieldValue(data.type) },
              { label: 'Значение по умолчанию', value: formatFieldValue(data.value) },
              { label: 'Описание', value: formatFieldValue(data.description) },
              { label: 'Bitrix ID', value: formatFieldValue(data.bitixId) },
              {
                  label: 'Bitrix Template ID',
                  value: formatFieldValue(data.bitrixTemplateId),
              },
              { label: 'Общее', value: formatFieldValue(data.isGeneral) },
              { label: 'По умолчанию', value: formatFieldValue(data.isDefault) },
              { label: 'Обязательное', value: formatFieldValue(data.isRequired) },
              { label: 'Активно', value: formatFieldValue(data.isActive) },
              { label: 'Множественное', value: formatFieldValue(data.isPlural) },
          ]
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">
                        {data?.name || `Поле #${id}`}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Глобальный справочник полей конструктора
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
                            disabled={deleteField.isPending}
                            onClick={() => {
                                setNotice(null);
                                deleteField.mutate(id, {
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
                    <CardTitle>Поле конструктора</CardTitle>
                </CardHeader>
                <CardContent>
                    {field.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : !data ? (
                        <p className="text-sm text-muted-foreground">
                            Поле #{id} не найдено.
                        </p>
                    ) : editing ? (
                        <FieldForm
                            initial={data}
                            submitting={updateField.isPending}
                            onCancel={() => setEditing(false)}
                            onSubmit={(values) => {
                                setNotice(null);
                                updateField.mutate(
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
        </div>
    );
}
