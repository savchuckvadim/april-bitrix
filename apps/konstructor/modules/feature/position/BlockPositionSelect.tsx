import {
    Select,
    SelectItem,
    SelectContent,
    SelectValue,
    SelectTrigger,
} from '@workspace/ui/components/select';

import { FC, useState } from 'react';
import {
    getPostionCurrentItemId,
    PositionBase,
} from './lib/getPostionCurrentItem';
import { useOfferTemplateKonstructor } from '@/modules/entities/offer-template-konstructor/hook/useOfferTemplateKonstructor';
import { BlockPostion } from '@/modules/entities/offer-template-konstructor';

export const BlockPositionSelect: FC<{
    initialcurrent: PositionBase;
    call: (position: BlockPostion) => void;
}> = ({ initialcurrent, call }) => {
    const { positions } = useOfferTemplateKonstructor();
    const currentId = getPostionCurrentItemId(initialcurrent, positions);
    // const [current, setCurrent] = useState(initialId)

    const onChange = (value: string) => {
        const positionId = Number(value);
        const currentItem = positions.find(
            position => position.id === positionId,
        );
        if (currentItem) {
            call(currentItem);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Select
                value={currentId?.toString() || ''}
                onValueChange={onChange}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Выберите позицию" />
                </SelectTrigger>
                <SelectContent>
                    {positions.map(position => (
                        <SelectItem
                            key={position.id}
                            value={position.id.toString()}
                        >
                            {position.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default BlockPositionSelect;
