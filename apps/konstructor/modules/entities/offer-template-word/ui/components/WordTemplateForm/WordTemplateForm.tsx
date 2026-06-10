'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    WordTemplateSummary,
    WordTemplateVisibility,
    CreateWordTemplateRequest,
    UpdateWordTemplateRequest,
} from '../../../types/word-template-types';
import { useAppSelector, useAuth } from '@/modules/app';
import { WordTemplateTagsExampleDownloadButton } from '../WordTemplateTagsExampleDownloadButton/WordTemplateTagsExampleDownloadButton';
import type { WordTemplateServerErrorPayload } from '../../../lib/word-template-api';
import { Field } from '@workspace/ui/shared';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Button } from '@workspace/ui/components/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

const TEMPLATE_NAME_MAX_LENGTH = 120;
const TEMPLATE_TAGS_MAX_LENGTH = 100;

interface WordTemplateFormProps {
    editingTemplate?: WordTemplateSummary | null;
    isSuperUser: boolean;
    onSubmit: (data: CreateWordTemplateRequest | UpdateWordTemplateRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const WordTemplateForm: React.FC<WordTemplateFormProps> = ({
    editingTemplate,
    isSuperUser,
    onSubmit,
    onCancel,
    isLoading = false,
}) => {
    const portal = useAppSelector((state) => state.portal.current);
    const { userId } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        file: null as File | null,
        tags: '',
        is_default: false,
        is_active: true,
        setAsCurrent: false,
        visibility: WordTemplateVisibility.USER,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverErrors, setServerErrors] = useState<string[]>([]);

    useEffect(() => {
        if (editingTemplate) {
            const visibilityStr = String(editingTemplate.visibility).toLowerCase();
            let visibility: WordTemplateVisibility = WordTemplateVisibility.USER;

            if (visibilityStr === WordTemplateVisibility.PUBLIC || visibilityStr === 'public') {
                visibility = WordTemplateVisibility.PUBLIC;
            } else if (
                visibilityStr === WordTemplateVisibility.PORTAL ||
                visibilityStr === 'portal' ||
                visibilityStr === 'private'
            ) {
                visibility = WordTemplateVisibility.PORTAL;
            } else {
                visibility = WordTemplateVisibility.USER;
            }

            setFormData({
                name: editingTemplate.name,
                file: null,
                tags: editingTemplate.tags || '',
                is_default: editingTemplate.is_default,
                is_active: editingTemplate.is_active,
                setAsCurrent: false,
                visibility,
            });
        } else {
            setFormData({
                name: '',
                file: null,
                tags: '',
                is_default: false,
                is_active: true,
                setAsCurrent: false,
                visibility: WordTemplateVisibility.USER,
            });
        }
        setErrors({});
        setServerErrors([]);
    }, [editingTemplate]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        const trimmedName = formData.name.trim();

        if (!trimmedName) {
            newErrors.name = 'Название обязательно';
        } else if (trimmedName.length > TEMPLATE_NAME_MAX_LENGTH) {
            newErrors.name = `Название не должно превышать ${TEMPLATE_NAME_MAX_LENGTH} символов`;
        }

        const trimmedTags = formData.tags.trim();
        if (trimmedTags.length > TEMPLATE_TAGS_MAX_LENGTH) {
            newErrors.tags = `Теги не должны превышать ${TEMPLATE_TAGS_MAX_LENGTH} символов`;
        }

        if (!editingTemplate && !formData.file) {
            newErrors.file = 'Файл обязателен при создании';
        }

        if (formData.is_default) {
            if (formData.visibility === WordTemplateVisibility.PUBLIC && !isSuperUser) {
                newErrors.is_default = 'Только суперпользователь может устанавливать публичные шаблоны по умолчанию';
            }
            if (formData.visibility === WordTemplateVisibility.USER && !isSuperUser) {
                newErrors.is_default =
                    'Шаблон по умолчанию может быть только для портала (PORTAL) или публичный (PUBLIC)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        let portal_id: number | undefined;
        let user_id: number | undefined;

        if (formData.visibility === WordTemplateVisibility.PUBLIC) {
            portal_id = undefined;
            user_id = undefined;
        } else if (formData.visibility === WordTemplateVisibility.PORTAL) {
            portal_id = portal?.id;
            user_id = undefined;
        } else {
            portal_id = portal?.id;
            user_id = userId;
        }

        const submitData: CreateWordTemplateRequest | UpdateWordTemplateRequest = {
            name: formData.name.trim(),
            file: formData.file || undefined,
            visibility: formData.visibility,
            tags: formData.tags.trim() || undefined,
            is_default: formData.is_default,
            is_active: formData.is_active,
            portal_id,
            user_id,
        };

        if (!editingTemplate && formData.setAsCurrent) {
            (submitData as { setAsCurrent?: boolean }).setAsCurrent = true;
        }

        try {
            await onSubmit(submitData);
        } catch (error) {
            const payload = (error as { payload?: WordTemplateServerErrorPayload })?.payload;
            const payloadErrors = payload?.errors;
            const message =
                payload?.message ||
                (error instanceof Error
                    ? error.message
                    : typeof error === 'string'
                      ? error
                      : 'Ошибка при сохранении шаблона');

            const details = Array.isArray(payloadErrors) ? payloadErrors : [];

            const isNameLengthError =
                /column:\s*name/i.test(message) ||
                (/name/i.test(message) && /too long/i.test(message)) ||
                details.some((detail) => /name/i.test(detail) && /too long|length|длин/i.test(detail));

            if (isNameLengthError) {
                setErrors((prev) => ({
                    ...prev,
                    name: `Слишком длинное название. Максимум ${TEMPLATE_NAME_MAX_LENGTH} символов`,
                }));
                setServerErrors(details);
                return;
            }

            const isTagsLengthError =
                /column:\s*tags/i.test(message) ||
                (/tags/i.test(message) && /too long/i.test(message)) ||
                details.some((detail) => /tags/i.test(detail) && /too long|length|длин/i.test(detail));

            if (isTagsLengthError) {
                setErrors((prev) => ({
                    ...prev,
                    tags: `Слишком длинная строка тегов. Максимум ${TEMPLATE_TAGS_MAX_LENGTH} символов`,
                }));
                setServerErrors(details);
                return;
            }

            setErrors((prev) => ({
                ...prev,
                form: message,
            }));
            setServerErrors(details);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData({ ...formData, file });
        if (errors.file) {
            setErrors({ ...errors, file: '' });
        }
    };

    const handleVisibilityChange = (value: string) => {
        const v = value as WordTemplateVisibility;
        setFormData((prev) => {
            const next = { ...prev, visibility: v };
            if (v === WordTemplateVisibility.USER && !isSuperUser && prev.is_default) {
                next.is_default = false;
            }
            return next;
        });
    };

    const handleIsDefaultChange = (checked: boolean) => {
        if (checked) {
            if (formData.visibility === WordTemplateVisibility.PUBLIC && !isSuperUser) {
                setErrors({
                    ...errors,
                    is_default: 'Только суперпользователь может устанавливать публичные шаблоны по умолчанию',
                });
                return;
            }
            if (formData.visibility === WordTemplateVisibility.USER && !isSuperUser) {
                setErrors({
                    ...errors,
                    is_default:
                        'Шаблон по умолчанию может быть только для портала (PORTAL) или публичный (PUBLIC)',
                });
                return;
            }
        }
        setFormData({ ...formData, is_default: checked });
        if (errors.is_default) {
            setErrors({ ...errors, is_default: '' });
        }
    };

    const visibilityDescription = useMemo(() => {
        switch (formData.visibility) {
            case WordTemplateVisibility.PUBLIC:
                return 'Публичный шаблон доступен во всех порталах всем пользователям. Только суперпользователь может создавать публичные шаблоны.';
            case WordTemplateVisibility.PORTAL:
                return 'Шаблон для всех пользователей портала. Будет доступен всем пользователям вашего портала.';
            case WordTemplateVisibility.USER:
            default:
                return 'Создание шаблона только для себя. Шаблон будет доступен только вам.';
        }
    }, [formData.visibility]);

    return (
        <form className="word-template-form mx-auto max-w-3xl space-y-5" onSubmit={handleSubmit}>
            <WordTemplateTagsExampleDownloadButton />

            <Field label="Название шаблона" error={errors.name} required>
                <Input
                    value={formData.name}
                    onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, name: value });
                        if (value.trim().length > TEMPLATE_NAME_MAX_LENGTH) {
                            setErrors((prev) => ({
                                ...prev,
                                name: `Название не должно превышать ${TEMPLATE_NAME_MAX_LENGTH} символов`,
                                form: '',
                            }));
                            setServerErrors([]);
                            return;
                        }
                        if (errors.name || errors.form) {
                            setErrors((prev) => ({ ...prev, name: '', form: '' }));
                        }
                        if (serverErrors.length) {
                            setServerErrors([]);
                        }
                    }}
                    aria-invalid={!!errors.name}
                    className={cn(errors.name && 'border-destructive')}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    {formData.name.trim().length}/{TEMPLATE_NAME_MAX_LENGTH}
                </p>
            </Field>

            <Field label="Файл .docx" error={errors.file} required={!editingTemplate}>
                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        id="template-file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        className="sr-only"
                    />
                    <label htmlFor="template-file">
                        <span
                            className={cn(
                                'inline-flex cursor-pointer items-center justify-center rounded-md border border-dashed border-input bg-muted/30 px-4 py-3 text-sm transition-colors hover:bg-muted/50',
                                errors.file && 'border-destructive',
                            )}
                        >
                            {formData.file
                                ? formData.file.name
                                : editingTemplate
                                  ? 'Загрузить новый файл (опционально)'
                                  : 'Выберите файл .docx *'}
                        </span>
                    </label>
                </div>
            </Field>

            <Field label="Теги (через запятую)" error={errors.tags} helperText="например: коммерция, договор, предложение">
                <Textarea
                    value={formData.tags}
                    onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, tags: value });
                        if (value.trim().length > TEMPLATE_TAGS_MAX_LENGTH) {
                            setErrors((prev) => ({
                                ...prev,
                                tags: `Теги не должны превышать ${TEMPLATE_TAGS_MAX_LENGTH} символов`,
                                form: '',
                            }));
                            setServerErrors([]);
                            return;
                        }
                        if (errors.tags || errors.form) {
                            setErrors((prev) => ({ ...prev, tags: '', form: '' }));
                        }
                        if (serverErrors.length) {
                            setServerErrors([]);
                        }
                    }}
                    rows={3}
                    aria-invalid={!!errors.tags}
                    className={cn(errors.tags && 'border-destructive')}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    {formData.tags.trim().length}/{TEMPLATE_TAGS_MAX_LENGTH}
                </p>
            </Field>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Видимость шаблона</Label>
                        <Select value={formData.visibility} onValueChange={handleVisibilityChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Видимость" />
                            </SelectTrigger>
                            <SelectContent>
                                {isSuperUser && (
                                    <SelectItem value={WordTemplateVisibility.PUBLIC}>Публичный (PUBLIC)</SelectItem>
                                )}
                                <SelectItem value={WordTemplateVisibility.PORTAL}>Для всех пользователей портала</SelectItem>
                                <SelectItem value={WordTemplateVisibility.USER}>Только для меня</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{visibilityDescription}</p>
                </div>

                <div className="space-y-4">
                    {(formData.visibility === WordTemplateVisibility.PORTAL ||
                        formData.visibility === WordTemplateVisibility.PUBLIC) && (
                        <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="is-default"
                                    checked={formData.is_default}
                                    onCheckedChange={(c) => handleIsDefaultChange(c === true)}
                                    disabled={formData.visibility === WordTemplateVisibility.PUBLIC && !isSuperUser}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="is-default" className="cursor-pointer font-medium">
                                        Установить как шаблон по умолчанию
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {errors.is_default ||
                                            (formData.is_default
                                                ? formData.visibility === WordTemplateVisibility.PUBLIC
                                                    ? 'Публичный шаблон по умолчанию'
                                                    : 'Шаблон портала по умолчанию'
                                                : 'Шаблон будет использоваться по умолчанию для всех пользователей')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
                {serverErrors.length > 0 && <p className="text-sm text-destructive">{serverErrors.join(', ')}</p>}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Сохранение...' : editingTemplate ? 'Сохранить изменения' : 'Создать шаблон'}
                </Button>
                {editingTemplate && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Отмена
                    </Button>
                )}
            </div>
        </form>
    );
};
