// import { documentFields, EnumDealDocumentFieldCode } from '@alfa/entities';
import { Bitrix, IBXDeal } from '@bitrix/index';

export const getCurrentRq = (deal: IBXDeal): number | undefined => {
    // const currentRq =
    //     deal[documentFields[EnumDealDocumentFieldCode.CURRENT_RQ].bitrixId];

    // return currentRq ? Number(currentRq) : undefined;
    // TODO with portal fields
    return 1;
};

export const setCurrentRq = async (dealId: number, rqId: number) => {
    // const bitrix = Bitrix.getService();
    // const value = rqId.toString() === '-1' ? '' : rqId.toString();

    // await bitrix.deal.update(dealId, {
    //     [documentFields[EnumDealDocumentFieldCode.CURRENT_RQ].bitrixId]: value,
    // });
    // TODO with portal fields
    return rqId;
};
