import { Table } from '@/modules/shared';
import { useOfferTemplateBlock } from '../../hook/useOfferTemplateBlock';
import { IOfferBlockPrice } from '../../type/offer-template-block.type';

const getPriceTableData = (
    block: IOfferBlockPrice,
): {
    name: string;
    actions: {
        name: string;
        value: number;
    }[];
}[] => {
    return block.content.cells.map(cell => ({
        name: cell.name,
        actions: [
            {
                name: 'Цена',
                value: Number(cell.price),
            },
            {
                name: 'Кол-во',
                value: Number(cell.quantity),
            },
            {
                name: 'Сумма',
                value: Number(cell.total),
            },
        ],
    }));
};

export const TemplatePrice = () => {
    const { blocks } = useOfferTemplateBlock();

    return (
        <div
            className="p-4"
            style={{
                height: blocks.price.height,
                zIndex: '-1000',
            }}
        >
            <Table
                key="table"
                code="offer-details"
                data={getPriceTableData(blocks.price)}
                firstCellName="Наименование"
            />
        </div>
    );
};
