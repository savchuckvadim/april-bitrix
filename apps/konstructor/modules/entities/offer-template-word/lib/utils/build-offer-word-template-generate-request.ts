// import { AppStateType } from "@/redux/store";
// import { DocumentStateCurrentParameterName } from "@/types/document/document-type";
// import { RecipientChangingProps } from "@/types/document/document-rq-type";
// import { ProductRowType, ShowSetStatusEnum } from "@/types/product-row-type";
// import { getAllRowsFromSets, getGeneralRowsFromSets } from "@/utils/reducers-utils/product/product-row";
// import { getDocumentInfoblocks, handleLtByLtOther } from "@/utils/reducers-utils/document/document-infoblocks-utils";
// import { InfoblockGroup } from "@/types/infoblock-type";
// import { IDocumentSendInvoice, IOfferWordByTemplateGenerateRequest } from "@/redux/reducers/document/document/type/document-by-word-template-request.dto";
// import { SupplyType } from "@/types/supply-type";
// import { PBX_CLIENT_TYPE, PBXClientTypeFieldItem } from "@/redux/reducers/company/company-reducer";
// import { getRqClientTypeByPbxCode } from "@/redux/reducers/company/utils/company-util";
// import { RQ_TYPE } from "@/redux/reducers/document/contract/type/document-contract-type";
// import { getContractLtypeFromContract } from "@/redux/reducers/deal/contract/contract.util";
// import { BXUser } from "@/types/bitrix/bitrix-type";
// import { getDocumentUserByBxUser } from "@/redux/reducers/document/document/type/request.helper";
// import { Contract } from "@/types/contract-type";
// import { ContractState } from "@/redux/reducers/deal/contract/contract-reducer";
// import { INVOICE_QUESTION } from "@/redux/reducers/document/document-invoice-reducer";
// import { DealItem, EV_DEAL_PROP } from "@/redux/reducers/pbx-deal/pbx-deal-reducer";
// import { formatFromBitrixDatetime } from "@/redux/reducers/document/contract/lib/document-contract-util";
// import { IS_PROD } from "@/appglobal/global-consts";
// import { ILtOtherState } from "@/modules/legal-tech-other/model/types/lt-others.type";

import { RootState } from "@/modules/app";
import type { OfferWordByTemplateGenerateDto } from "@workspace/nest-api";

/**
 * Собирает DTO для offer-word-document (generate / generate-ephemeral-pdf) из Redux.
 * Возвращает null, если нет выбранного шаблона или сделки / контракта.
 */
// IOfferWordByTemplateGenerateRequest
export function buildOfferWordTemplateGenerateRequest(
    state: RootState,
): OfferWordByTemplateGenerateDto | null {
    const currentWordTemplate = state.offerTemplateWord.selectedTemplate;
    const currentWordTemplateId = currentWordTemplate?.id;
    // const invoiceTemplate = state.invoiceTemplate.currentTemplate;
    // const invoiceTemplateId = invoiceTemplate?.id;

    // if (!currentWordTemplateId) {
    //     return null;
    // }

    // const newDealId = state.app.dealId;
    // if (newDealId == null || newDealId === "") {
    //     return null;
    // }

    // const document = state.document;
    // const provider = document.current[DocumentStateCurrentParameterName.PROVIDER];
    // const recipient = document.current[DocumentStateCurrentParameterName.RECIPIENT];
    // const isWord = document.isWord;

    // const bxUser = state.app.currentUser as BXUser;
    // const manager = getDocumentUserByBxUser(bxUser);

    // // const generalProducts = state.rows.sets.general;
    // // const alternativeProducts = state.rows.sets.alternative;
    // const isSetShow = state.rows.show === ShowSetStatusEnum.ROWS ? false : true;
    // // const generalProductRows: ProductRowType[] = getGeneralRowsFromSets(generalProducts[0], isSetShow);
    // const allProductRows = getAllRowsFromSets(state.rows.sets, isSetShow);

    // const pbxCompany = state.company;
    // const clientTypeCurrentCode = (pbxCompany?.op_client_type?.current as PBXClientTypeFieldItem | undefined)?.code;
    // const clientType: RQ_TYPE = clientTypeCurrentCode
    //     ? getRqClientTypeByPbxCode(clientTypeCurrentCode as PBX_CLIENT_TYPE)
    //     : RQ_TYPE.ORGANIZATION;

    // const contract = (state.contract as ContractState | undefined)?.current as Contract | null | undefined;
    // if (!contract) {
    //     return null;
    // }

    // const supply = state.od.currentOd as SupplyType;

    // const fieldsInfoblocks = state.infoblocks as InfoblockGroup[];
    // const fieldsFreeblocks = state.freeBlocks as InfoblockGroup;
    // const fieldsEr = state.encyclopedias as InfoblockGroup[];
    // const fieldsConsalting = state.consalting as InfoblockGroup;
    // const fieldsLT = state.legalTech as InfoblockGroup;
    // const fieldsStar = state.star as InfoblockGroup;
    // const regions = state.region?.current ?? {};
    // const fieldsAcademy = state.academyBlocks as InfoblockGroup;
    // const ltOtherPackets = (state.ltOthers as ILtOtherState).packets;
    // const ltOtherServices = ltOtherPackets.flatMap(packet => packet.services);
    // const fieldsLTHandled = handleLtByLtOther(fieldsLT, ltOtherServices);

    // const documentInfoblocks = getDocumentInfoblocks(
    //     fieldsInfoblocks,
    //     fieldsFreeblocks,
    //     fieldsEr,
    //     fieldsConsalting,
    //     fieldsLTHandled,
    //     fieldsStar,
    //     regions,
    //     fieldsAcademy,
    // );

    // const contractType = getContractLtypeFromContract(contract);
    // const invoiceData = state.documentInvoice.menu.questions;

    // const pbxDeal = state.pbxDeal;
    // const pbxFirstPayDateItem = pbxDeal?.[EV_DEAL_PROP.first_pay_date] as DealItem | undefined;
    // const pbxInvoiceNumberItem = pbxDeal?.[EV_DEAL_PROP.supply_invoice_number] as DealItem | undefined;
    // const invoiceDate = pbxFirstPayDateItem?.current
    //     ? formatFromBitrixDatetime(pbxFirstPayDateItem.current as string)
    //     : state.documentInvoice.date;
    // const invoiceNumber = (pbxInvoiceNumberItem?.current as string) ?? '';

    // const needGeneralInvoice: boolean = invoiceData[INVOICE_QUESTION.ONE].value;
    // const needManyInvoices: boolean = invoiceData[INVOICE_QUESTION.MANY].value;
    // const isByPresentationInvoices: boolean = invoiceData[INVOICE_QUESTION.PRESENTATION].value;
    // const invoice: IDocumentSendInvoice = {
    //     needGeneralInvoice,
    //     needManyInvoices,
    //     isByPresentationInvoices,
    //     invoiceDate,
    //     invoiceNumber,
    // }
    // return {
    //     templateId: currentWordTemplateId.toString(),
    //     invoiceTemplateId: invoiceTemplateId?.toString() ?? '',
    //     domain: state.app.domain,
    //     companyId: state.app.company,
    //     dealId: String(newDealId),
    //     providerId: provider?.id ?? 0,
    //     userId: Number(state.app.user),
    //     rows: allProductRows,
    //     total: state.rows.sets.general[0].total[0],
    //     complect: documentInfoblocks,
    //     supply,
    //     contract,
    //     sets: state.rows.sets,
    //     clientType,
    //     contractType,
    //     isWord,
    //     recipient: {
    //         name: recipient[RecipientChangingProps.RECIPIENT]?.trim(),
    //         nameCase: recipient[RecipientChangingProps.RECIPIENT_CASE]?.trim(),
    //         inn: recipient[RecipientChangingProps.INN]?.trim(),
    //         companyName: recipient[RecipientChangingProps.COMPANY_NAME]?.trim(),
    //         position: recipient[RecipientChangingProps.POSITION]?.trim(),
    //         positionCase: recipient[RecipientChangingProps.POSITION_CASE]?.trim(),
    //     },
    //     manager,
    //     invoice,
    //     withoutQueue: !IS_PROD,
    // };
    return null;
}
