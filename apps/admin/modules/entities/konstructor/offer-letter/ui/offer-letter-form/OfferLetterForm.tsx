'use client';

import { Button } from '@workspace/ui/components/button';
import { DialogFooter } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { EmployeePicker } from '@/modules/entities/portal/employees';
import {
    OFFER_LETTER_DIALOG_TEXT as TEXT,
    OFFER_LETTER_FORM_SCOPE_OPTIONS,
    OFFER_LETTER_NAME_MAX_LENGTH,
    OFFER_LETTER_SORT_MAX,
    OFFER_LETTER_TEXT_MAX_LENGTH,
} from '../../consts/offer-letter.consts';
import { OFFER_LETTER_SCOPE, type OfferLetter } from '../../model';
import { OfferLetterEditor } from '../offer-letter-editor/OfferLetterEditor';
import { useOfferLetterForm } from './hooks/use-offer-letter-form';

interface OfferLetterFormProps {
    portalId: number;
    /** Письмо для правки; null — новое письмо */
    letter: OfferLetter | null;
    onDone: () => void;
    onCancel: () => void;
}

/** Поля письма: название, чьё оно, текст с форматированием, активность, порядок */
export function OfferLetterForm({ portalId, letter, onDone, onCancel }: OfferLetterFormProps) {
    const form = useOfferLetterForm({ portalId, letter, onDone });
    const { values, errors } = form;

    return (
        <>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="offer-letter-name">{TEXT.name}</Label>
                    <Input
                        id="offer-letter-name"
                        value={values.name}
                        maxLength={OFFER_LETTER_NAME_MAX_LENGTH}
                        placeholder={TEXT.namePlaceholder}
                        aria-invalid={Boolean(errors.name)}
                        onChange={event => form.setField('name', event.target.value)}
                    />
                    {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="offer-letter-scope">{TEXT.scope}</Label>
                        <Select
                            value={
                                values.isPersonal
                                    ? OFFER_LETTER_SCOPE.PERSONAL
                                    : OFFER_LETTER_SCOPE.PORTAL
                            }
                            disabled={form.isEdit}
                            onValueChange={value =>
                                form.setField('isPersonal', value === OFFER_LETTER_SCOPE.PERSONAL)
                            }
                        >
                            <SelectTrigger id="offer-letter-scope">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {OFFER_LETTER_FORM_SCOPE_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {values.isPersonal ? (
                        <div className="space-y-2">
                            <Label htmlFor="offer-letter-manager">{TEXT.manager}</Label>
                            <EmployeePicker
                                portalId={portalId}
                                id={values.bxUserId}
                                inputId="offer-letter-manager"
                                disabled={form.isEdit}
                                onChange={id => form.setField('bxUserId', id)}
                            />
                            {errors.bxUserId ? (
                                <p className="text-xs text-destructive">{errors.bxUserId}</p>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                <OfferLetterEditor
                    id="offer-letter-text"
                    value={values.text}
                    maxLength={OFFER_LETTER_TEXT_MAX_LENGTH}
                    error={errors.text}
                    onChange={text => form.setField('text', text)}
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="offer-letter-active"
                                checked={values.isActive}
                                onCheckedChange={checked => form.setField('isActive', checked)}
                            />
                            <Label htmlFor="offer-letter-active">{TEXT.isActive}</Label>
                        </div>
                        {form.wasDefault && !values.isActive ? (
                            <p className="text-xs text-muted-foreground">
                                {TEXT.deactivateDefaultHint}
                            </p>
                        ) : null}
                    </div>

                    {form.isEdit ? null : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="offer-letter-default"
                                    checked={values.isDefault && values.isActive}
                                    disabled={!values.isActive}
                                    onCheckedChange={checked => form.setField('isDefault', checked)}
                                />
                                <Label htmlFor="offer-letter-default">{TEXT.isDefault}</Label>
                            </div>
                            <p className="text-xs text-muted-foreground">{TEXT.isDefaultHint}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="offer-letter-sort">{TEXT.sort}</Label>
                        <Input
                            id="offer-letter-sort"
                            type="number"
                            min={0}
                            max={OFFER_LETTER_SORT_MAX}
                            value={values.sort}
                            aria-invalid={Boolean(errors.sort)}
                            onChange={event => form.setField('sort', event.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            {errors.sort ?? TEXT.sortHint}
                        </p>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>
                    {TEXT.cancel}
                </Button>
                <Button disabled={form.isSubmitting} onClick={() => void form.submit()}>
                    {form.submitLabel}
                </Button>
            </DialogFooter>
        </>
    );
}
