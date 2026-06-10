'use client';

import { useState } from 'react';
import {
    filterFieldItems,
    getRqShowName,
    useBxRq,
} from '@workspace/bx-rq';

import {
    RQ_TYPE,
    CONTRACT_LTYPE,
    SupplyTypesType,
    EvsRqItem,
    getClinetTypeNameByCode,
    isFieldsEmpty,
} from '@workspace/bx-rq';

import { Save, X } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@workspace/ui/components/tabs';

// import { useClientType } from '@/modules/features/client-type/hook/useClientType';
import { useAppSelector, useIsClientMounted } from '@/modules/app';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { PagePreloader } from '@/modules/shared';
import {
    BxRqAddressEdit,
    BxRqBaseEdit,
    BxRqBankEdit,
} from '@/modules/entities/bx-rq';

interface BxRqPageProps {
    currentClientType?: RQ_TYPE;
    contractType?: CONTRACT_LTYPE;
    supplyType?: SupplyTypesType;
    onSave?: () => void;
    onCancel?: () => void;
    isSimpleBankCommentMode?: boolean;
}

export const BxRqPage = ({
    onSave, //для сохранения текущих реквизитов в карточку сделки
    onCancel,
}: BxRqPageProps) => {
    const dispatch = useAppDispatch();
    const {
        rqs,
        isLoading,
        isFetched,
        current,

        setCurrent,
        saveBase,
        getRqFillPercent,
    } = useBxRq();

    const domain = useAppSelector(state => state.app.domain);
    const companyId = useAppSelector(state => state.app.bitrix.company?.ID);
    const [isSaving, setIsSaving] = useState(false);
    // const { clientType } = useClientType();
    const isClient = useIsClientMounted();


    if (!isClient) {
        return null;
    }
    /**
     *
     * HARD CODRE
     */
    const clientType = RQ_TYPE.ORGANIZATION;

    const percent = getRqFillPercent(current.item, clientType as RQ_TYPE);

    const handleSaveBase = async () => {
        setIsSaving(true);
        try {
            await saveBase(domain, companyId || 0, clientType as RQ_TYPE);
        } catch (error) {
            console.error('Ошибка сохранения основных полей:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        onCancel?.();
    };

    if (isLoading) {
        return <PagePreloader text="Загрузка реквизитов..." />;
    }

    if (!isFetched || !rqs) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">
                        Реквизиты не загружены
                    </p>
                </CardContent>
            </Card>
        );
    }

    const currentRqs = current.items;
    const currentRq = current.item;

    if (!currentRq) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-muted-foreground">
                        Реквизиты не найдены
                    </p>
                </CardContent>
            </Card>
        );
    }

    const fields = filterFieldItems(
        currentRq.fields,
        clientType || (RQ_TYPE.ORGANIZATION as RQ_TYPE),
    );

    const isEmpty = fields ? isFieldsEmpty(fields) : false;

    const handleRqSelect = (rqId: string) => {
        const selected = currentRqs.find(
            (rq: EvsRqItem) => rq.bx_id.toString() === rqId,
        );
        if (selected) {
            setCurrent({
                ...selected,
            });
        }
    };

    return (
        <div id="modal-root" className="container  mx-auto p-6 min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Реквизиты</h1>
                <div className="flex gap-2">
                    {onCancel && (
                        <Button variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Отмена
                        </Button>
                    )}
                    {onSave && (
                        <Button onClick={onSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Сохранить
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>Реквизиты</span>
                        {currentRq.bx_id !== -1 && (
                            <Badge
                                variant="secondary"
                                className="bg-primary/60 text-primary-foreground"
                            >
                                {getClinetTypeNameByCode(clientType)}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4  min-h-[500px]">
                    {/* Селект реквизитов */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {getClinetTypeNameByCode(clientType)}
                        </label>
                        <Select
                            value={currentRq.bx_id.toString()}
                            onValueChange={handleRqSelect}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите реквизиты" />
                            </SelectTrigger>
                            <SelectContent>
                                {currentRqs.map((rq: EvsRqItem) => {
                                    const displayName = getRqShowName(
                                        rq.fields,
                                        clientType as RQ_TYPE,
                                        45,
                                    );
                                    return (
                                        <SelectItem
                                            key={rq.bx_id}
                                            value={rq.bx_id.toString()}
                                        >
                                            {displayName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs defaultValue="base" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="base">Основные</TabsTrigger>
                            <TabsTrigger value="addresses">Адреса</TabsTrigger>
                            <TabsTrigger value="bank">Банковские</TabsTrigger>
                        </TabsList>

                        <TabsContent value="base" className="space-y-4">
                            {fields && (
                                <BxRqBaseEdit
                                    rq={currentRq}
                                    fields={fields}
                                    isEmpty={isEmpty}
                                    percent={percent.base}
                                    onSave={handleSaveBase}
                                    onCancel={handleCancel}
                                    isLoading={isSaving}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="addresses" className="space-y-4">
                            {!isEmpty &&
                            currentRq.address?.items &&
                            currentRq.address.items.length > 0 ? (
                                <BxRqAddressEdit />
                            ) : (
                                <Card>
                                    <CardContent className="text-center p-6">
                                        <p className="text-muted-foreground">
                                            Адреса отсутствуют
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="bank" className="space-y-4">
                            {!isEmpty && currentRq.bank ? (
                                <BxRqBankEdit bank={currentRq.bank.current} />
                            ) : (
                                <Card>
                                    <CardContent className="text-center p-6">
                                        <p className="text-muted-foreground">
                                            Банковские реквизиты отсутствуют
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Сообщение если реквизиты пустые */}
                    {isEmpty && (
                        <div className="text-center p-6">
                            <p className="text-muted-foreground">
                                Реквизиты не заполнены или не подходят для
                                выбранного типа контракта
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
