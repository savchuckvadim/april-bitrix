'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { BxRqEditModal } from './BxRqEditModal';
import {
    BankRqItem,
    RqItem,
    isFieldsEmpty,
    useBxRqEditBank,
} from '@workspace/bx-rq';
import { Edit2, Plus } from 'lucide-react';
import { useApp } from '@/modules/app/lib/hooks/app';

interface BxRqBankEditProps {
    bank: BankRqItem;
    // onSave: (bankId: number, fields: RqItem[]) => void
    // onCancel: () => void
    // isLoading?: boolean
}

export const BxRqBankEdit = ({
    bank,
    // onSave,
    // onCancel,
    // isLoading = false
}: BxRqBankEditProps) => {
    // const [editingBankId, setEditingBankId] = useState<number | null>(null)
    // const [editedFields, setEditedFields] = useState<Record<number, RqItem[]>>({})

    // const bankItems = bank.items && bank.items.length ? bank.items : [bank.current]

    const { domain, companyId } = useApp();
    const {
        creating,
        percent,
        isCreatingLoading,
        initBankCreating,
        cancelBankCreating,
        saveBank,
        setBankProp,
    } = useBxRqEditBank();
    const handleFieldChange = (bankId: number, code: string, value: string) => {
        setBankProp(code, value);
    };

    const handleSave = (bankId: number) => {
        saveBank(domain, companyId);
    };

    const handleCancel = () => {
        cancelBankCreating();
    };

    const handleEdit = (bankId: number) => {
        initBankCreating();
    };

    const handleAddNew = () => {
        initBankCreating();
    };
    const isEmpty =
        bank && bank.fields && bank.fields.length > 0
            ? isFieldsEmpty(bank.fields)
            : true;

    return (
        <>
            <div className="space-y-4">
                {bank && bank.fields && bank.fields.length > 0 && (
                    <Card key={creating?.id || 'bank-creating-card'}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={
                                            isEmpty ? 'text-red-500' : ''
                                        }
                                    >
                                        Банковские реквизиты
                                    </span>
                                    {!isEmpty && (
                                        <Badge
                                            variant="secondary"
                                            className={
                                                percent > 75
                                                    ? 'bg-green-500'
                                                    : percent > 20
                                                      ? 'bg-yellow-500'
                                                      : 'bg-red-500'
                                            }
                                        >
                                            Заполнено {percent}%
                                        </Badge>
                                    )}
                                    {isEmpty && (
                                        <Badge variant="destructive">
                                            Не заполнено
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        handleEdit(creating?.id || -1)
                                    }
                                    disabled={isCreatingLoading}
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    {isEmpty ? 'Добавить' : 'Редактировать'}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bank.fields && bank.fields.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {bank.fields.map((field: RqItem) => (
                                        <div
                                            key={field.code}
                                            className="space-y-1"
                                        >
                                            <label className="text-sm text-muted-foreground">
                                                {field.name}
                                            </label>
                                            <div className="text-sm font-medium">
                                                {(field.value as string) || (
                                                    <span className="text-muted-foreground">
                                                        Не заполнено
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-6">
                                    <p className="text-muted-foreground">
                                        Банковские реквизиты не заполнены
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {bank && bank.fields && bank.fields.length === 0 && (
                    <Card>
                        <CardContent className="text-center p-6">
                            <p className="text-muted-foreground mb-4">
                                Банковские реквизиты отсутствуют
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleAddNew}
                                disabled={isCreatingLoading}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить банковские реквизиты
                            </Button>
                        </CardContent>
                    </Card>
                )}
                {creating && (
                    <BxRqEditModal
                        title="Редактирование банковских реквизитов"
                        fields={creating.fields || []}
                        isOpen={!!creating.id}
                        isLoading={isCreatingLoading}
                        onSave={() => handleSave(creating.id)}
                        onCancel={handleCancel}
                        onFieldChange={(code, value) =>
                            handleFieldChange(creating.id, code, value)
                        }
                        type="bank"
                    />
                )}
            </div>
        </>
    );
};
