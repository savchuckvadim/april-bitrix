'use client';

import { Edit2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { useApp } from '@/modules/app/lib/hooks/app';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useClientType } from '@/modules/entities/deal/lib/hooks/use-client-type';
import { BxRqEditModal } from './BxRqEditModal';
import { RqFillBadge } from './RqFillBadge';
import { RqFieldValue } from './RqFieldValue';
import { isFieldsEmpty } from '../lib/field-items-util';
import { useBxRqEditBank } from '../lib/hooks/use-bx-rq';

/** Банковские реквизиты текущего реквизита (один банк, как в легаси). */
export const BxRqBankEdit = () => {
    const { domain, companyId } = useApp();
    const { resolved: clientType } = useClientType();
    const bank = useAppSelector(state => state.bxrq.current.item?.bank.current ?? null);
    const edit = useBxRqEditBank();
    const hasFields = Boolean(bank && bank.fields.length > 0);
    const isEmpty = !bank || isFieldsEmpty(bank.fields);

    return (
        <div className="space-y-4">
            {hasFields && bank ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={isEmpty ? 'text-destructive' : ''}>
                                    Банковские реквизиты
                                </span>
                                {isEmpty ? (
                                    <Badge variant="destructive">Не заполнено</Badge>
                                ) : (
                                    <RqFillBadge percent={edit.percent} />
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={edit.initBankCreating}
                                disabled={edit.isCreatingLoading}
                            >
                                <Edit2 className="mr-2 h-4 w-4" />
                                {isEmpty ? 'Добавить' : 'Редактировать'}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {bank.fields.map(field => (
                                <RqFieldValue key={field.code} field={field} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="mb-4 text-muted-foreground">Банковские реквизиты отсутствуют</p>
                        <Button
                            variant="outline"
                            onClick={edit.initBankCreating}
                            disabled={edit.isCreatingLoading || !bank}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить банковские реквизиты
                        </Button>
                    </CardContent>
                </Card>
            )}

            {edit.creating ? (
                <BxRqEditModal
                    title="Редактирование банковских реквизитов"
                    fields={edit.creating.fields}
                    isOpen
                    isLoading={edit.isCreatingLoading}
                    onSave={() => void edit.saveBank(domain, companyId, clientType)}
                    onCancel={edit.cancelBankCreating}
                    onFieldChange={edit.setBankProp}
                    type="bank"
                />
            ) : null}
        </div>
    );
};
