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
    RqItem,
    RQ_TYPE,
    BX_ADDRESS_TYPE,
    isFieldsEmpty,
    useBxRqEditAddress,
    AddressTypeId,
    getAddressFillPercent,
} from '@workspace/bx-rq';
import { Edit2, Copy, CheckCircle } from 'lucide-react';
import { useApp } from '@/modules/app/lib/hooks/app';
import { useClientType } from '@/modules/feature/client-type/hook/useClientType';

interface BxRqAddressEditProps {
    // addresses: AddressRqItem[]
    // // currentClientType: RQ_TYPE
    // onSave: (typeId: BX_ADDRESS_TYPE, fields: RqItem[]) => void
    // onCopy: (fromTypeId: BX_ADDRESS_TYPE, toTypeId: BX_ADDRESS_TYPE) => void
    // onCancel: () => void
    // isLoading?: boolean
}

export const BxRqAddressEdit = ({}: BxRqAddressEditProps) => {
    // const [editingTypeId, setEditingTypeId] = useState<BX_ADDRESS_TYPE | null>(null)
    // const [editedFields, setEditedFields] = useState<Record<BX_ADDRESS_TYPE, RqItem[]>>({} as Record<BX_ADDRESS_TYPE, RqItem[]>)
    const { domain, companyId } = useApp();
    const { clientType } = useClientType();
    const {
        addresses,
        percent,
        registredPercent,
        primaryPercent,
        creating,
        isCreatingLoading,

        initAddressCreating,
        cancelAddressCreating,
        saveAddress,
        initCopyAddressCreating,
        setAddressProp,
    } = useBxRqEditAddress();

    const handleFieldChange = (
        typeId: BX_ADDRESS_TYPE,
        code: string,
        value: string,
    ) => {
        setAddressProp(code, value);
    };

    const handleSave = (typeId: BX_ADDRESS_TYPE) => {
        // const fields = editedFields[typeId] || addresses.find(addr => addr.type_id === typeId)?.fields || []
        // onSave(typeId, fields)
        // setEditingTypeId(null)
        saveAddress(
            domain,
            companyId,
            clientType as RQ_TYPE,
            typeId,
            creating?.fields || [],
        );
    };

    const handleCancel = () => {
        cancelAddressCreating();
    };

    const handleEdit = (typeId: BX_ADDRESS_TYPE) => {
        initAddressCreating(typeId);
    };

    const handleCopy = (toTypeId: AddressTypeId) => {
        // fromTypeId: BX_ADDRESS_TYPE,
        initCopyAddressCreating(toTypeId);
    };

    const getAddressDisplayName = (typeId: BX_ADDRESS_TYPE) => {
        switch (typeId) {
            case BX_ADDRESS_TYPE.PRIMARY:
                return 'Фактический адрес';
            case BX_ADDRESS_TYPE.REGISTERED:
                return 'Юридический адрес';
            case BX_ADDRESS_TYPE.REGISTERED_FIZ:
                return 'Адрес прописки';
            default:
                return 'Адрес';
        }
    };

    const getSourceTypeForCopy = (typeId: BX_ADDRESS_TYPE) => {
        switch (typeId) {
            case BX_ADDRESS_TYPE.PRIMARY:
                return BX_ADDRESS_TYPE.REGISTERED;
            case BX_ADDRESS_TYPE.REGISTERED:
                return BX_ADDRESS_TYPE.PRIMARY;
            default:
                return BX_ADDRESS_TYPE.REGISTERED;
        }
    };

    return (
        <div className="space-y-4">
            {addresses.map(address => {
                const isEmpty = isFieldsEmpty(address.fields);

                const otherIsFull = addresses.some(
                    otherAddress =>
                        otherAddress.type_id !== address.type_id &&
                        !isFieldsEmpty(otherAddress.fields),
                );
                const sourceType = getSourceTypeForCopy(address.type_id);
                const canCopy = otherIsFull && isEmpty;
                const addressPercent = //getAddressFillPercent([address]);
                    address.type_id === BX_ADDRESS_TYPE.REGISTERED
                        ? registredPercent
                        : primaryPercent;
                return (
                    <Card key={address.type_id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={
                                            isEmpty ? 'text-red-500' : ''
                                        }
                                    >
                                        {getAddressDisplayName(address.type_id)}
                                    </span>
                                    {!isEmpty && (
                                        <Badge
                                            variant="secondary"
                                            className={
                                                addressPercent > 75
                                                    ? 'bg-green-500'
                                                    : addressPercent > 20
                                                      ? 'bg-yellow-500'
                                                      : 'bg-red-500'
                                            }
                                        >
                                            Заполнено {addressPercent}%
                                        </Badge>
                                    )}
                                    {isEmpty && (
                                        <Badge variant="destructive">
                                            Не заполнено
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {canCopy && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            // onClick={() => handleCopy(sourceType, address.type_id)}
                                            onClick={() =>
                                                handleCopy(address.type_id)
                                            }
                                            disabled={isCreatingLoading}
                                            title={`Скопировать из ${getAddressDisplayName(sourceType)}`}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleEdit(address.type_id)
                                        }
                                        disabled={isCreatingLoading}
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        {isEmpty ? 'Добавить' : 'Редактировать'}
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!isEmpty ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(address.fields as RqItem[]).map(field => (
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
                                        Адрес не заполнен
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {creating && creating.fields && creating.fields.length > 0 && (
                <BxRqEditModal
                    title={`Редактирование ${getAddressDisplayName(creating.type_id)}`}
                    fields={creating.fields || []}
                    isOpen={!!creating.type_id}
                    isLoading={isCreatingLoading}
                    onSave={() => handleSave(creating.type_id)}
                    onCancel={handleCancel}
                    onFieldChange={(code, value) =>
                        handleFieldChange(creating.type_id, code, value)
                    }
                    type="address"
                />
            )}
        </div>
    );
};
