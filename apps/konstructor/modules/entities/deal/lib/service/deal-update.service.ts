import { Bitrix } from '@bitrix/index';
export const updateDeal = async (
    dealId: number,
    fieldBitrixId: string,
    value: string | number,
) => {
    const bitrix = Bitrix.getService();
    await bitrix.deal.update(dealId, {
        [fieldBitrixId]: value,
    });
};
