import type { RootState } from '@/modules/app/model/store';
import { resolveSupply, selectCatalog } from '../../catalog';
import { selectComplectVariantState, selectVariantStageOf } from '../../complect-variant';
import {
    SUPPLY_REPORT_DEAL_FIELDS,
    buildDocRegions,
    contractRequestBlocker,
    missingDealFields,
    missingRequisites,
    toContractBxRq,
} from '../../contract-document';
import { getDealClientType } from '../../deal';
import { buildDocBody, toDocRows } from '../../document-payload';
import { buildVariantsPayload, toOfferClientType } from '../../offer-document';
import { RQ_TYPE_NAME, RQ_TYPE } from '../../bx-rq/model/types';
import { findMainRow } from '../../row-set';
import { selectServiceSmartId } from '../../service-offer/model/ServiceOfferSlice';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import type { InitSupplyFile, InitSupplyRequest, SupplyFormRequest, SupplyReportGenerateRequest } from '../model/dto';
import { RPA_ARM_COMPLECT_CODE, SUPPLY_REPORT_COMPANY_CODES } from '../model/types';
import { buildPbxEntityItems, buildPresentPbxEntityItems } from './pbx-entity-items.util';
import { toReportContact } from './supply-contacts.util';
import { missingSupplyFields, visibleSupplyItems, type SupplyFormScope } from './supply-form.util';

const CLIENT_TYPE_NAME: Record<string, string> = {
    [RQ_TYPE.ORGANIZATION]: RQ_TYPE_NAME.ORGANIZATION,
    [RQ_TYPE.BUDGET]: RQ_TYPE_NAME.BUDGET,
    [RQ_TYPE.IP]: RQ_TYPE_NAME.IP,
    [RQ_TYPE.FIZ]: RQ_TYPE_NAME.FIZ,
};

const clientTypeOf = (state: RootState) =>
    toOfferClientType(
        getDealClientType(state.portal.current?.bitrixDeal ?? undefined, state.app.bitrix.deal ?? undefined),
    );

/** Содержание отчёта из текущей сборки — та же легаси-форма, что у договора. */
const reportBody = (state: RootState) => {
    const catalog = selectCatalog(state);
    const general = state.rowSet.general;
    const main = findMainRow(general);
    if (!main?.composition) return null;
    const supply = resolveSupply(catalog, main.refs.supplyCode);
    const body = buildDocBody({ catalog, general, alternative: [] });
    if (!body || !supply) return null;
    const region = catalog.regions.byCode[state.rowSet.context.regionCode ?? ''];
    return {
        catalog,
        general,
        composition: main.composition,
        supply,
        body: { ...body, rows: toDocRows(catalog, { ...general, collapsed: false }, []) },
        region: region
            ? { number: 0, abs: region.abs, name: region.code, title: region.title, infoblock: region.title }
            : { number: 0, abs: 1, name: '', title: '', infoblock: '' },
    };
};

/** Область формы: по ней фильтруются поля (тип клиента, договора, поставки). */
export const supplyFormScope = (state: RootState): SupplyFormScope | null => {
    const content = reportBody(state);
    if (!content) return null;
    return {
        clientType: clientTypeOf(state),
        contractType: content.body.contractType,
        // тип поставки в каталоге — internet | proxima, как и в форме
        supplyType: content.body.supply.type as SupplyFormScope['supplyType'],
    };
};

/** Запрос состава формы: домен, поставщик и область. */
export const buildSupplyFormRequest = (state: RootState): SupplyFormRequest | null => {
    const scope = supplyFormScope(state);
    if (!scope || !state.app.domain) return null;
    return {
        domain: state.app.domain,
        providerId: Number(state.documentProvider.current?.id) || undefined,
        contractType: scope.contractType,
        clientType: scope.clientType,
        supplyType: scope.supplyType,
    };
};

/** Почему отчёт сейчас не собрать — те же условия, что у договора. */
export const supplyReportBlocker = (state: RootState): string | null => contractRequestBlocker(state);

/** Чего не хватает: обязательные поля сделки, реквизиты, обязательные поля формы. */
export const supplyReportValidationErrors = (state: RootState): string[] => {
    const scope = supplyFormScope(state);
    const visible = scope ? visibleSupplyItems(state.supplyReport.items, scope) : [];
    return [
        ...missingDealFields(state.contractDocument.dealFields, SUPPLY_REPORT_DEAL_FIELDS),
        ...missingRequisites(
            getDealClientType(state.portal.current?.bitrixDeal ?? undefined, state.app.bitrix.deal ?? undefined),
            state.bxrq.current.item,
        ),
        ...missingSupplyFields(visible, state.supplyReport.files),
    ];
};

const dealItemsOf = (state: RootState) =>
    buildPbxEntityItems({
        fields: state.portal.current?.bitrixDeal?.bitrixfields ?? null,
        entity: state.app.bitrix.deal,
        codes: SUPPLY_REPORT_DEAL_FIELDS.map(field => field.code),
        overrides: state.contractDocument.dealFields,
        requiredCodes: SUPPLY_REPORT_DEAL_FIELDS.filter(field => field.required).map(field => field.code),
    });

const companyItemsOf = (state: RootState) =>
    buildPresentPbxEntityItems({
        fields: state.portal.current?.company?.bitrixfields ?? null,
        entity: state.app.bitrix.company,
        codes: SUPPLY_REPORT_COMPANY_CODES,
    });

/** Поля формы в payload: только видимые менеджеру (легаси слал всё, бэк читал по коду). */
const supplyItemsOf = (state: RootState, scope: SupplyFormScope) =>
    visibleSupplyItems(state.supplyReport.items, scope);

/** Запрос `document-supply-report/generate-document`; блокер или нет сборки — null. */
export const buildSupplyReportGenerateRequest = (state: RootState): SupplyReportGenerateRequest | null => {
    if (supplyReportBlocker(state)) return null;
    const content = reportBody(state);
    const scope = supplyFormScope(state);
    const { domain, dealId, bitrix } = state.app;
    const provider = state.documentProvider.current;
    const rq = state.bxrq.current.item;
    if (!content || !scope || !dealId || !provider || !rq) return null;
    const { body, catalog, composition, supply, region } = content;
    const clientType = clientTypeOf(state);

    return {
        domain,
        companyId: String(bitrix.company?.ID ?? ''),
        dealId: String(dealId),
        providerId: Number(provider.id) || 0,
        userId: Number(bitrix.user?.ID) || 0,
        contractType: body.contractType,
        complect: body.complect,
        supply: {
            name: body.supply.name,
            forkp: supply.quantityForKp ?? '',
            number: body.supply.number,
            type: body.supply.type,
        },
        contract: body.contract,
        regions: buildDocRegions(catalog, composition),
        region,
        rows: body.rows,
        arows: body.rows,
        total: body.total,
        contractStart: state.contractDocument.dealFields['contract_start'] ?? '',
        contractEnd: state.contractDocument.dealFields['contract_end'] ?? '',
        contractNumber: state.contractDocument.contractNumber,
        contractCreateDate: state.contractDocument.dealFields['contract_create_date'] ?? '',
        garantClientAssignedName: state.contractDocument.dealFields['garant_client_assigned_name'] ?? '',
        garantClientEmail: state.contractDocument.dealFields['garant_client_email'] ?? '',
        firstPayDate: state.contractDocument.dealFields['first_pay_date'] ?? '',
        clientType,
        bxrq: toContractBxRq(rq),
        contractSpecificationState: { items: state.contractDocument.specification },
        bxCompanyItems: companyItemsOf(state),
        bxContacts: state.supplyReport.contacts.map(toReportContact),
        bxDealItems: dealItemsOf(state),
        // generate ждёт свободную форму — интерфейс без индексной сигнатуры разворачиваем
        supplyReport: supplyItemsOf(state, scope).map(item => ({ ...item })),
        contractProviderState: { current: { rq: { fullname: provider.name } } },
        isSupplyReport: true,
        rpa_id: state.supplyReport.rpaId ? String(state.supplyReport.rpaId) : undefined,
    };
};

/** Запрос `konstructor/init-supply` после отчёта: заявка RPA, файлы в сделку, таймлайн по участникам. */
export const buildInitSupplyRequest = (
    state: RootState,
    fileLink: string,
    files: InitSupplyFile[],
): InitSupplyRequest | null => {
    const content = reportBody(state);
    const scope = supplyFormScope(state);
    const { domain, dealId, bitrix } = state.app;
    const provider = state.documentProvider.current;
    const rq = state.bxrq.current.item;
    if (!content || !scope || !dealId || !provider || !rq) return null;
    const { body, catalog, composition, region } = content;
    const clientType = clientTypeOf(state);
    const variantState = selectComplectVariantState(state);
    const variants = buildVariantsPayload({
        catalog,
        records: variantState.records,
        items: variantState.items,
        stageOf: selectVariantStageOf(state),
        openVariantSmartId: variantState.openVariantSmartId,
        live: { general: state.rowSet.general, alternative: state.rowSet.alternative },
    });
    const dealFields = state.portal.current?.bitrixDeal?.bitrixfields ?? null;
    const armField = dealFields?.find(field => field.code === RPA_ARM_COMPLECT_CODE);
    const armRaw = armField && bitrix.deal ? bitrix.deal[`UF_CRM_${armField.bitrixId}`] : undefined;
    const complectArmIds = Array.isArray(armRaw) ? armRaw.map(String) : armRaw ? [String(armRaw)] : [];

    return {
        domain,
        rpa_id: state.supplyReport.rpaId,
        providerId: Number(provider.id) || 0,
        userId: Number(bitrix.user?.ID) || null,
        companyId: Number(bitrix.company?.ID) || null,
        companyName: bitrix.company?.TITLE ?? '',
        dealId,
        // «следующий период» сервисного отдела — заявка знает свой смарт
        serviceSmartId: selectServiceSmartId(state),
        bxContacts: state.supplyReport.contacts.map(contact => ({ ID: contact.ID })),
        contract: body.contract,
        contractType: body.contractType,
        regions: buildDocRegions(catalog, composition),
        region,
        bxrq: toContractBxRq(rq),
        clientType: { code: clientType, name: CLIENT_TYPE_NAME[clientType] ?? clientType },
        contractSpecificationState: { items: state.contractDocument.specification },
        supplyReport: supplyItemsOf(state, scope),
        bxDealItems: dealItemsOf(state),
        bxCompanyItems: companyItemsOf(state),
        file: fileLink,
        complectArmIds,
        // легаси читал UF_CRM_USER_CARDNUM компании напрямую — кода в pbx-каноне нет
        clientArmId: '',
        supply: body.supply,
        total: [body.total],
        // сервисный отдел — перезаключение, продажи — поставка
        flow: state.app.department === APP_DEP.SERVICE ? 'renewal' : 'supply',
        files,
        variants: variants.length > 1 ? variants : undefined,
    };
};
