'use client';

import { Copy, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { useApp } from '@/modules/app/lib/hooks/app';
import { useClientType } from '@/modules/entities/deal/lib/hooks/use-client-type';
import { BxRqEditModal } from './BxRqEditModal';
import { RqFillBadge } from './RqFillBadge';
import { RqFieldValue } from './RqFieldValue';
import { BX_ADDRESS_TYPE } from '../model/types';
import { isFieldsEmpty } from '../lib/field-items-util';
import { addressTitle } from '../lib/address-util';
import { useBxRqEditAddress } from '../lib/hooks/use-bx-rq';

/** Откуда копировать пустой адрес: из другого адреса реквизита. */
const copySourceOf = (typeId: BX_ADDRESS_TYPE): BX_ADDRESS_TYPE =>
    typeId === BX_ADDRESS_TYPE.PRIMARY ? BX_ADDRESS_TYPE.REGISTERED : BX_ADDRESS_TYPE.PRIMARY;

/** Адреса текущего реквизита: юридический и фактический, правка и копирование. */
export const BxRqAddressEdit = () => {
    const { domain, companyId } = useApp();
    const { resolved: clientType } = useClientType();
    const address = useBxRqEditAddress();

    return (
        <div className="space-y-4">
            {address.addresses.map(item => {
                const isEmpty = isFieldsEmpty(item.fields);
                const otherIsFull = address.addresses.some(
                    other => other.type_id !== item.type_id && !isFieldsEmpty(other.fields),
                );
                const percent =
                    item.type_id === BX_ADDRESS_TYPE.REGISTERED
                        ? address.registredPercent
                        : address.primaryPercent;
                const title = addressTitle(item.type_id);
                return (
                    <Card key={item.type_id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={isEmpty ? 'text-destructive' : ''}>{title}</span>
                                    {isEmpty ? (
                                        <Badge variant="destructive">Не заполнено</Badge>
                                    ) : (
                                        <RqFillBadge percent={percent} />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {otherIsFull && isEmpty ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => address.initCopyAddressCreating(item.type_id)}
                                            disabled={address.isCreatingLoading}
                                            title={`Скопировать из «${addressTitle(copySourceOf(item.type_id))}»`}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    ) : null}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => address.initAddressCreating(item.type_id)}
                                        disabled={address.isCreatingLoading}
                                    >
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        {isEmpty ? 'Добавить' : 'Редактировать'}
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEmpty ? (
                                <p className="p-6 text-center text-muted-foreground">Адрес не заполнен</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {item.fields.map(field => (
                                        <RqFieldValue key={field.code} field={field} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {address.creating ? (
                <BxRqEditModal
                    title={`Редактирование: ${addressTitle(address.creating.type_id)}`}
                    fields={address.creating.fields}
                    isOpen
                    isLoading={address.isCreatingLoading}
                    onSave={() =>
                        void address.saveAddress(
                            domain,
                            companyId,
                            clientType,
                            address.creating!.type_id,
                        )
                    }
                    onCancel={address.cancelAddressCreating}
                    onFieldChange={address.setAddressProp}
                    type="address"
                />
            ) : null}
        </div>
    );
};
