'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { BANK_RQ_ITEM_CODE, RqItem } from '@workspace/bx-rq';
import { Loader2 } from 'lucide-react';
import { isFieldRequired } from '../lib/utils/is-field-required';
import { useBxRqEditBase } from '@workspace/bx-rq';
import { MicroPreloader } from '@/modules/shared/';
import { ComponentPreloader } from '@/modules/shared';
import { createPortal } from 'react-dom';

interface BxRqEditModalProps {
    title: string;
    fields: RqItem[];
    isOpen: boolean;
    isLoading?: boolean;
    type: 'base' | 'address' | 'bank';
    onSave: () => void;
    onCancel: () => void;
    onFieldChange: (code: string, value: string) => void;
    onFieldBlur?: (code: string, value: string) => void;
    isSimpleBankCommentMode?: boolean;
    simpleBankCommentValue?: string;
    onSimpleBankCommentChange?: (value: string) => void;
    submitError?: string | null;
}

export const BxRqEditModal = ({
    title,
    fields,
    isOpen,
    isLoading = false,
    type,
    onSave,
    onCancel,
    onFieldChange,
    onFieldBlur,
    isSimpleBankCommentMode = false,
    simpleBankCommentValue = '',
    onSimpleBankCommentChange,
    submitError = null,
}: BxRqEditModalProps) => {
    const [localValues, setLocalValues] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});

    const handleFieldChange = (code: string, value: string) => {
        setLocalValues(prev => ({ ...prev, [code]: value }));
        setValidationErrors(prev => {
            if (!prev[code]) return prev;
            const next = { ...prev };
            delete next[code];
            return next;
        });
        onFieldChange(code, value);
    };

    const handleFieldBlur = (code: string, value: string) => {
        if (onFieldBlur) {
            onFieldBlur(code, value);
        }
    };

    const { caseLoading } = useBxRqEditBase();

    const getFieldValue = (field: RqItem) =>
        localValues[field.code] ||
        (typeof field.value === 'string' ? field.value : '') ||
        '';

    const validateBeforeSave = () => {
        const nextErrors: Record<string, string> = {};

        const innField = fields.find(field => field.code === 'inn');
        if (innField) {
            const innValue = getFieldValue(innField).trim();
            if (innValue && innValue.length > 15) {
                nextErrors[innField.code] = 'ИНН не должен быть длиннее 15 символов';
            }
        }

        if (type === 'bank') {
            const bankNameField = fields.find(
                field => field.code === BANK_RQ_ITEM_CODE.BANK_NAME,
            );

            if (bankNameField && !getFieldValue(bankNameField).trim()) {
                nextErrors[bankNameField.code] = 'Заполните название банка';
            }
        }

        setValidationErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSaveClick = () => {
        if (!validateBeforeSave()) {
            return;
        }
        onSave();
    };

    const renderField = (field: RqItem) => {
        const value = getFieldValue(field);
        const fieldError = validationErrors[field.code];
        if (caseLoading.includes(field.code)) {
            return (
                <div className="flex justify-center items-center h-10">
                    <MicroPreloader fullWidth={true} />
                </div>
            );
        }

        switch (field.type) {
            case 'text':

                return (
                    <div key={field.code} className="space-y-2">
                        <Label htmlFor={field.code}>
                            {field.name}
                            {field.isRequired && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </Label>
                        <Textarea
                            id={field.code}
                            value={value}
                            onChange={e =>
                                handleFieldChange(field.code, e.target.value)
                            }
                            onBlur={e =>
                                handleFieldBlur(field.code, e.target.value)
                            }
                            placeholder={`Введите ${field.name.toLowerCase()}`}
                            disabled={field.isDisable}
                        />
                        {fieldError && (
                            <p className="text-sm text-red-500">{fieldError}</p>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.code} className="space-y-2">
                        <Label htmlFor={field.code}>
                            {field.name}
                            {field.isRequired && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </Label>
                        <Select
                            value={value}
                            onValueChange={newValue =>
                                handleFieldChange(field.code, newValue)
                            }
                            disabled={field.isDisable}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={`Выберите ${field.name.toLowerCase()}`}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {field.items?.map(item => (
                                    <SelectItem
                                        key={item.id}
                                        value={item.id.toString()}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {fieldError && (
                            <p className="text-sm text-red-500">{fieldError}</p>
                        )}
                    </div>
                );

            case 'date':
                return (
                    <div key={field.code} className="space-y-2">
                        <Label htmlFor={field.code}>
                            {field.name}
                            {field.isRequired && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </Label>
                        <Input
                            id={field.code}
                            type="date"
                            value={value}
                            onChange={e =>
                                handleFieldChange(field.code, e.target.value)
                            }
                            onBlur={e =>
                                handleFieldBlur(field.code, e.target.value)
                            }
                            disabled={field.isDisable}
                        />
                        {fieldError && (
                            <p className="text-sm text-red-500">{fieldError}</p>
                        )}
                    </div>
                );

            default:
                return (
                    <div key={field.code} className="space-y-2">
                        <Label htmlFor={field.code}>
                            {field.name}
                            {isFieldRequired(field) && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </Label>
                        <Input
                            id={field.code}
                            type="text"
                            // defaultValue={value}
                            value={value}
                            onChange={e =>
                                handleFieldChange(field.code, e.target.value)
                            }
                            onBlur={e =>
                                handleFieldBlur(field.code, e.target.value)
                            }
                            placeholder={`Введите ${field.name.toLowerCase()}`}
                        // disabled={field.isDisable}
                        />
                        {fieldError && (
                            <p className="text-sm text-red-500">{fieldError}</p>
                        )}
                    </div>
                );
        }
    };
    const modalRoot =
        document.getElementById('modal-root') || document.body;

    if (!isOpen) return null;
    return createPortal(
        <>
            {/* <div className="bg-background/20 backdrop-blur-xs min-h-screen w-full absolute top-0  left-0 z-10"></div> */}
            <Dialog open={isOpen} onOpenChange={onCancel} modal={true}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {isLoading ? (
                        <div className=" min-h-[400px] min-w-full ">
                            <ComponentPreloader text="Загрузка..." />
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>{title}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                {fields.map(renderField)}
                                {type === 'base' && isSimpleBankCommentMode && (
                                    <div className="space-y-2">
                                        <Label htmlFor="simple_bank_comment">
                                            Комментарий к банковским реквизитам
                                        </Label>
                                        <Textarea
                                            id="simple_bank_comment"
                                            value={simpleBankCommentValue}
                                            onChange={e =>
                                                onSimpleBankCommentChange?.(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Введите комментарий к банковским реквизитам"
                                        />
                                    </div>
                                )}
                            </div>
                            {submitError && (
                                <div className="mt-3 text-sm text-red-600">
                                    {submitError}
                                </div>
                            )}
                        </>
                    )}
                    <DialogFooter>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                disabled={isLoading}
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={handleSaveClick}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    'Сохранить'
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>,
        modalRoot,
    );
};
