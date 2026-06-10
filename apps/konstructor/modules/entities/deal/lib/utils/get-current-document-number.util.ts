import { IBXDeal } from '@bitrix/index';

export const getCurrentDocumentNumber = (
    deal: IBXDeal,
): { number: string; prefix: string } => {
    let number = '';
    let prefix = '';

    // const dynamicPrefixField = getDynamicPrefixFieldData();

    // if (dynamicPrefixField && dynamicPrefixField.bitrixId) {
    //     const dynamicPrefixFieldBitrixId = dynamicPrefixField.bitrixId;
    //     const dynamicPrefixFieldValue = deal[dynamicPrefixFieldBitrixId] || '';
    //     prefix = dynamicPrefixFieldValue as string;
    // }

    // const currentDocumentNumberField = getCurrentDocumentNumberFieldData();
    // if (currentDocumentNumberField && currentDocumentNumberField.bitrixId) {
    //     const currentDocumentNumberFieldBitrixId =
    //         currentDocumentNumberField.bitrixId;
    //     const currentDocumentNumberFieldValue =
    //         deal[currentDocumentNumberFieldBitrixId] || '';
    //     number = currentDocumentNumberFieldValue as string;
    // }

    return {
        number,
        prefix,
    };
};

export const getDynamicPrefixFieldData = () => {
    // const result = documentFields[EnumDealDocumentFieldCode.PREFIX_DYNAMIC];
    const result = 'PREFIX_DYNAMIC';
    return result;
};
export const getCurrentDocumentNumberFieldData = () => {
    // const result = documentFields[EnumDealDocumentFieldCode.NUMBER_CURRENT_DOC];
    const result = 'NUMBER_CURRENT_DOC';
    return result;
};
