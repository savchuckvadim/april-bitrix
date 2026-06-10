'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useDeal } from '../hook/useDeal';
import { MicroPreloader } from '@/modules/shared/';
import { Tooltip } from '@/modules/shared';
import { TFieldItem, TFieldSelect } from '../type/deal-field.type';

export const ClientTypeSelect = () => {
    const { fetched, loading } = useDeal();

    // TODO(@alfa migration): the client-type field, its current value and option
    // list came from the deal-field data that is mid-migration (previously via
    // @alfa/entities + getFieldValuByCode). Stubbed so the component renders an
    // empty select; persisting the change (updateFieldWithAPI →
    // organization_type) is likewise pending.
    const clientTypeField = undefined as
        | (TFieldSelect & { value?: string })
        | undefined;
    const clientType = clientTypeField?.value;
    const clientTypeList: TFieldItem[] | undefined = clientTypeField?.list;

    if (loading || !fetched) {
        return <MicroPreloader />;
    }
    return (
        <Tooltip content="Текущий тип клиента">
            <div>
                <Select
                    value={clientType}
                    onValueChange={() => {
                        // TODO(@alfa migration): persist organization_type change.
                    }}
                    defaultValue={clientType}
                >
                    <SelectTrigger
                        style={{
                            cursor: 'pointer',
                        }}
                        size="sm"
                        className="h-5 border-primary/30 text-primary w-[200px]"
                    >
                        <SelectValue placeholder="Выберите тип клиента" />
                    </SelectTrigger>
                    <SelectContent
                        className="text-primary"
                        style={{
                            cursor: 'pointer',
                        }}
                    >
                        {clientTypeList?.map(item => (
                            <SelectItem
                                className="text-primary cursor-pointer"
                                key={String(item.bitrixId)}
                                value={String(item.bitrixId)}
                            >
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </Tooltip>
    );
};
