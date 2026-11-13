'use client';

import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { CONTRACT_EDIT_FIELDS, type Contract } from '../../model';
import { ContractEditFieldInput } from './ContractEditFieldInput';
import { useContractEditForm } from './hooks/use-contract-edit-form';

export interface ContractEditDialogProps {
    contract: Contract;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** Правка подписей и текстов вида договора — общая для всех порталов. */
export function ContractEditDialog({ contract, open, onOpenChange }: ContractEditDialogProps) {
    const form = useContractEditForm(contract, open, () => onOpenChange(false));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Вид договора «{contract.code}»</DialogTitle>
                    <DialogDescription>
                        Правка видна сразу на всех порталах. Код, номер, тип и цифры расчёта
                        здесь не меняются: по ним генерация выбирает шаблоны и считает суммы.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {CONTRACT_EDIT_FIELDS.map(field => (
                        <ContractEditFieldInput
                            key={field.key}
                            field={field}
                            value={form.draft[field.key]}
                            invalid={form.missingKeys.includes(field.key)}
                            onChange={value => form.setField(field.key, value)}
                        />
                    ))}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={form.isSubmitting}
                        onClick={() => onOpenChange(false)}
                    >
                        Отмена
                    </Button>
                    <Button type="button" disabled={!form.canSubmit} onClick={() => void form.submit()}>
                        {form.isSubmitting ? 'Сохранение…' : 'Сохранить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
