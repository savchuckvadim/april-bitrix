'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { FormFieldRenderer, type FormFieldConfig } from '@/modules/shared/ui';
import {
    CLIENT_TYPE_OPTIONS,
    EMPTY_CRITERIA_HELPER_TEXT,
    SUPPLY_REPORT_FIELDS_HELPER_TEXT,
    SUPPLY_REPORT_FIELD_OPTIONS,
    SUPPLY_TYPE_OPTIONS,
} from '@/modules/entities/konstructor/lib';
import {
    SUPPLY_REPORT_TEMPLATE_SCOPE,
    type ISupplyReportTemplateFormValues,
} from '../../model';
import {
    emptyFormValues,
    findUnknownSupplyReportFieldCodes,
} from '../../lib/utils';

/** Подписи уровней привязки. «Общий» = `portal_id IS NULL`. */
const SCOPE_OPTIONS = [
    { value: SUPPLY_REPORT_TEMPLATE_SCOPE.common, label: 'Общий (для всех порталов)' },
    { value: SUPPLY_REPORT_TEMPLATE_SCOPE.portal, label: 'Портальный' },
    { value: SUPPLY_REPORT_TEMPLATE_SCOPE.provider, label: 'Портальный под поставщика' },
];

interface SupplyReportTemplateFormProps {
    mode: 'create' | 'edit';
    initialValues?: ISupplyReportTemplateFormValues;
    /** Портальное дерево: портал зафиксирован, уровень не выбирается. */
    portalId?: string;
    isLoading?: boolean;
    onSubmit: (values: ISupplyReportTemplateFormValues) => void;
    onCancel?: () => void;
}

export function SupplyReportTemplateForm({
    mode,
    initialValues,
    portalId,
    isLoading = false,
    onSubmit,
    onCancel,
}: SupplyReportTemplateFormProps) {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ISupplyReportTemplateFormValues>({
        defaultValues: initialValues ?? emptyFormValues(portalId),
    });

    const scope = watch('scope');
    const file = watch('file');
    const demo = watch('demo');
    const requiredFields = watch('required_fields');
    const optionalFields = watch('optional_fields');

    /** Файл шаблона обязателен только при создании: при правке он остаётся. */
    const [fileError, setFileError] = React.useState<string | null>(null);

    /**
     * Коды, которых нет в текущем определении формы на бэке. Появляются,
     * если шаблон сохранён до изменения формы: бэкенд такой код отвергнет,
     * поэтому предупреждаем до отправки.
     */
    const unknownCodes = React.useMemo(
        () =>
            findUnknownSupplyReportFieldCodes([
                ...(requiredFields ?? []),
                ...(optionalFields ?? []),
            ]),
        [requiredFields, optionalFields],
    );

    const showPortalField =
        !portalId && scope !== SUPPLY_REPORT_TEMPLATE_SCOPE.common;
    const showAgentField = scope === SUPPLY_REPORT_TEMPLATE_SCOPE.provider;

    const fields: FormFieldConfig[] = React.useMemo(() => {
        const list: FormFieldConfig[] = [
            {
                name: 'name',
                label: 'Название',
                type: 'text',
                required: true,
                placeholder: 'Отчёт о поставке, интернет',
            },
        ];

        if (!portalId) {
            list.push({
                name: 'scope',
                label: 'Уровень привязки',
                type: 'select',
                required: true,
                options: SCOPE_OPTIONS,
                helperText:
                    '«Общий» — шаблон виден всем порталам (на бэке portal_id пустой).',
            });
        }

        if (showPortalField) {
            list.push({
                name: 'portal_id',
                label: 'ID портала',
                type: 'text',
                required: true,
                placeholder: '7',
            });
        }

        if (showAgentField) {
            list.push({
                name: 'agent_id',
                label: 'ID поставщика',
                type: 'text',
                required: true,
                placeholder: '42',
                helperText:
                    'Пусто — шаблон годится любому поставщику портала.',
            });
        }

        list.push(
            {
                name: 'client_types',
                label: 'Типы клиента',
                type: 'multiselect',
                options: CLIENT_TYPE_OPTIONS,
                helperText: EMPTY_CRITERIA_HELPER_TEXT,
            },
            {
                name: 'supply_types',
                label: 'Виды размещения',
                type: 'multiselect',
                options: SUPPLY_TYPE_OPTIONS,
                helperText: EMPTY_CRITERIA_HELPER_TEXT,
            },
            {
                name: 'required_fields',
                label: 'Обязательные поля формы',
                type: 'multiselect',
                options: SUPPLY_REPORT_FIELD_OPTIONS,
                helperText: SUPPLY_REPORT_FIELDS_HELPER_TEXT,
            },
            {
                name: 'optional_fields',
                label: 'Необязательные поля формы',
                type: 'multiselect',
                options: SUPPLY_REPORT_FIELD_OPTIONS,
                helperText: SUPPLY_REPORT_FIELDS_HELPER_TEXT,
            },
            {
                name: 'description',
                label: 'Описание',
                type: 'textarea',
                placeholder: 'Редакция от 01.10.2026',
            },
            {
                name: 'is_default',
                label: 'Шаблон по умолчанию',
                type: 'boolean',
                helperText:
                    'Снимет флаг у остальных шаблонов этой же области (портал + поставщик).',
            },
            {
                name: 'is_active',
                label: 'Активен',
                type: 'boolean',
                helperText: 'Неактивные шаблоны не участвуют в подборе.',
            },
        );

        return list;
    }, [portalId, showAgentField, showPortalField]);

    const onSubmitForm = (values: ISupplyReportTemplateFormValues) => {
        if (mode === 'create' && !values.file) {
            setFileError('Загрузите файл шаблона (.docx)');
            return;
        }
        setFileError(null);
        onSubmit(values);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {mode === 'create'
                        ? 'Создать шаблон отчёта о поставке'
                        : 'Редактировать шаблон отчёта о поставке'}
                </CardTitle>
                <CardDescription>
                    Загрузите DOCX-шаблон и задайте условия, при которых он
                    подбирается
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmitForm)}>
                <CardContent className="space-y-4">
                    {fields.map((fieldConfig) => (
                        <FormFieldRenderer<ISupplyReportTemplateFormValues>
                            key={fieldConfig.name}
                            fieldConfig={fieldConfig}
                            register={register}
                            control={control}
                            errors={errors}
                        />
                    ))}

                    {unknownCodes.length > 0 && (
                        <p className="text-sm text-destructive">
                            Эти коды полей отсутствуют в текущей форме отчёта и
                            будут отклонены бэкендом: {unknownCodes.join(', ')}
                        </p>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="supply-report-template-file">
                            Файл шаблона (.docx)
                            {mode === 'create' && (
                                <span className="text-destructive"> *</span>
                            )}
                        </Label>
                        <Input
                            id="supply-report-template-file"
                            type="file"
                            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(event) => {
                                const selected = event.target.files?.[0] ?? null;
                                setValue('file', selected);
                                if (selected) {
                                    setFileError(null);
                                }
                            }}
                        />
                        {file && (
                            <p className="text-xs text-muted-foreground">
                                Выбран файл: {file.name}
                            </p>
                        )}
                        {mode === 'edit' && !file && (
                            <p className="text-xs text-muted-foreground">
                                Файл не выбран — текущий шаблон останется без
                                изменений.
                            </p>
                        )}
                        {fileError && (
                            <p className="text-sm text-destructive">{fileError}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="supply-report-template-demo">
                            Демо-файл (заполненный пример, необязательно)
                        </Label>
                        <Input
                            id="supply-report-template-demo"
                            type="file"
                            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(event) => {
                                setValue('demo', event.target.files?.[0] ?? null);
                            }}
                        />
                        {demo && (
                            <p className="text-xs text-muted-foreground">
                                Выбран файл: {demo.name}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Отмена
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading
                            ? 'Сохранение…'
                            : mode === 'create'
                              ? 'Создать'
                              : 'Сохранить'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
