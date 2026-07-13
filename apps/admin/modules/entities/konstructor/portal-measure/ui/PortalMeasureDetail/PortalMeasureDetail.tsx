'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/modules/entities/portal/hooks';
import { useMeasure } from '@/modules/entities/konstructor/measure';
import {
    FieldList,
    formatFieldValue,
    type FieldRow,
} from '@/modules/entities/konstructor/lib';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    useDeletePortalMeasure,
    usePortalMeasures,
    useUpdatePortalMeasure,
} from '../../lib/hooks';

/**
 * Детали портальной единицы измерения: собственные поля `portal_measure` плюс
 * связанная глобальная единица измерения (`measures`) отдельным блоком.
 */
export function PortalMeasureDetail({
    portalId,
    id,
}: {
    portalId: number;
    id: number;
}) {
    const router = useRouter();
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;
    const measures = usePortalMeasures(domain);
    const updateMeasure = useUpdatePortalMeasure();
    const deleteMeasure = useDeletePortalMeasure();

    const measure = React.useMemo(
        () => (measures.data ?? []).find((m) => m.id === id),
        [measures.data, id],
    );

    const globalMeasure = useMeasure(measure?.measure_id);
    const base = `/portal/${portalId}/konstructor/measure`;

    const [editing, setEditing] = React.useState(false);
    const [notice, setNotice] = React.useState<string | null>(null);
    const [draft, setDraft] = React.useState({
        name: '',
        shortName: '',
        fullName: '',
        bitrixId: '',
    });

    const startEdit = () => {
        if (!measure) return;
        setDraft({
            name: measure.name ?? '',
            shortName: measure.shortName ?? '',
            fullName: measure.fullName ?? '',
            bitrixId: measure.bitrixId ?? '',
        });
        setNotice(null);
        setEditing(true);
    };

    const saveEdit = () => {
        if (!measure) return;
        setNotice(null);
        updateMeasure.mutate(
            {
                id: measure.id,
                dto: {
                    name: draft.name.trim() || undefined,
                    shortName: draft.shortName.trim() || undefined,
                    fullName: draft.fullName.trim() || undefined,
                    bitrixId: draft.bitrixId.trim() || undefined,
                },
            },
            {
                onSuccess: () => {
                    setEditing(false);
                    setNotice('Изменения сохранены.');
                },
                onError: (e) => setNotice(getApiErrorMessage(e)),
            },
        );
    };

    const portalRows: FieldRow[] = measure
        ? [
              { label: 'ID', value: formatFieldValue(measure.id) },
              { label: 'ID глоб. единицы', value: formatFieldValue(measure.measure_id) },
              { label: 'ID портала', value: formatFieldValue(measure.portal_id) },
              { label: 'Bitrix ID', value: formatFieldValue(measure.bitrixId) },
              { label: 'Наименование', value: formatFieldValue(measure.name) },
              { label: 'Краткое', value: formatFieldValue(measure.shortName) },
              { label: 'Полное', value: formatFieldValue(measure.fullName) },
          ]
        : [];

    const globalRows: FieldRow[] = globalMeasure.data
        ? [
              { label: 'ID', value: formatFieldValue(globalMeasure.data.id) },
              { label: 'Наименование', value: formatFieldValue(globalMeasure.data.name) },
              { label: 'Краткое', value: formatFieldValue(globalMeasure.data.shortName) },
              { label: 'Полное', value: formatFieldValue(globalMeasure.data.fullName) },
              { label: 'Код', value: formatFieldValue(globalMeasure.data.code) },
              { label: 'Тип', value: formatFieldValue(globalMeasure.data.type) },
          ]
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">
                        {measure?.name || `Единица портала #${id}`}
                    </h1>
                    <p className="text-sm text-muted-foreground">Портал: {domain ?? '…'}</p>
                </div>
                <div className="flex gap-2">
                    {measure && !editing && (
                        <Button variant="outline" onClick={startEdit}>
                            Редактировать
                        </Button>
                    )}
                    {measure && (
                        <Button
                            variant="destructive"
                            disabled={deleteMeasure.isPending}
                            onClick={() => {
                                setNotice(null);
                                deleteMeasure.mutate(measure.id, {
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
                    <CardTitle>Портальная единица измерения</CardTitle>
                </CardHeader>
                <CardContent>
                    {measures.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : !measure ? (
                        <p className="text-sm text-muted-foreground">
                            Единица измерения #{id} не найдена у портала.
                        </p>
                    ) : editing ? (
                        <div className="space-y-3">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label>Наименование</Label>
                                    <Input
                                        value={draft.name}
                                        onChange={(e) =>
                                            setDraft((d) => ({ ...d, name: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Краткое</Label>
                                    <Input
                                        value={draft.shortName}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                shortName: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Полное</Label>
                                    <Input
                                        value={draft.fullName}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                fullName: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Bitrix ID</Label>
                                    <Input
                                        value={draft.bitrixId}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                bitrixId: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditing(false)}
                                    disabled={updateMeasure.isPending}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    onClick={saveEdit}
                                    disabled={updateMeasure.isPending}
                                >
                                    {updateMeasure.isPending ? 'Сохранение…' : 'Сохранить'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <FieldList rows={portalRows} />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Связь: глобальная единица измерения</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {!measure ? (
                        <p className="text-sm text-muted-foreground">—</p>
                    ) : globalMeasure.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : !globalMeasure.data ? (
                        <p className="text-sm text-muted-foreground">
                            Глобальная единица #{measure.measure_id} недоступна.
                        </p>
                    ) : (
                        <>
                            <FieldList rows={globalRows} />
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/konstructor/measure/${measure.measure_id}`}>
                                    Открыть глобальную единицу →
                                </Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
