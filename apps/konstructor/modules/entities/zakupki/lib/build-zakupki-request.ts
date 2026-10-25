import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { buildDocRegions } from '../../contract-document';
import { buildDocBody } from '../../document-payload';
import { findMainRow } from '../../row-set';
import type {
    ZakupkiOfferRequest,
    ZakupkiOtherProviderField,
    ZakupkiOtherProviders,
    ZakupkiProviderField,
    ZakupkiRecipient,
} from '../model/dto';
import { selectZakupkiProviderFields } from '../model/ZakupkiSlice';

/** Поле настроек → поле payload генерации (легаси слал форму настроек как есть). */
const toOtherProviderField = (field: ZakupkiProviderField): ZakupkiOtherProviderField => ({
    id: field.id,
    name: field.name,
    placeholder: field.placeholder,
    code: field.code,
    value: field.value,
    type: field.type,
    isRequired: field.isRequired,
});

export const buildOtherProviders = (state: RootState): ZakupkiOtherProviders => ({
    provider1: selectZakupkiProviderFields(state, 'provider1').map(toOtherProviderField),
    provider2: selectZakupkiProviderFields(state, 'provider2').map(toOtherProviderField),
});

/** Получатель КП из шапки документа (entities/offer-document) в легаси-форме RecipientDto. */
const recipientOf = (state: RootState): ZakupkiRecipient => {
    const recipient = state.offerDocument.recipient;
    return {
        companyName: recipient.companyName,
        inn: recipient.inn,
        position: recipient.position,
        positionCase: recipient.positionCase,
        recipient: recipient.name,
        recipientCase: recipient.nameCase,
        companyAdress: '',
        code: 'recipient',
        type: 'recipient',
    };
};

/** Почему «3 КП» сейчас не собрать; null — можно. */
export const zakupkiRequestBlocker = (state: RootState): string | null => {
    if (!state.app.domain) return 'Приложение не инициализировано';
    if (!state.app.dealId) return 'Сначала сохраните сделку — КП прикрепляются к ней';
    if (!findMainRow(state.rowSet.general)) return 'Нет главной строки: соберите комплект';
    if (!state.documentProvider.current) return 'Выберите поставщика';
    if (!state.zakupki.settings) return 'Настройки поставщиков ещё не загружены';
    const requiredEmpty = [
        ...selectZakupkiProviderFields(state, 'provider1'),
        ...selectZakupkiProviderFields(state, 'provider2'),
    ].filter(field => field.isRequired && !field.value?.trim());
    if (requiredEmpty.length) return `Заполните поставщиков: ${requiredEmpty.map(field => field.name).join(', ')}`;
    if (!state.contractDocument.dealFields['contract_start'] || !state.contractDocument.dealFields['contract_end']) {
        return 'Укажите период действия договора';
    }
    return null;
};

/** Запрос `zakupki-offer/create`: наше КП + два вымышленных поставщика из настроек. */
export const buildZakupkiRequest = (state: RootState): ZakupkiOfferRequest | null => {
    if (zakupkiRequestBlocker(state)) return null;
    const catalog = selectCatalog(state);
    const general = state.rowSet.general;
    const main = findMainRow(general);
    const provider = state.documentProvider.current;
    const { domain, dealId, bitrix } = state.app;
    if (!main?.composition || !provider || !dealId) return null;
    const body = buildDocBody({ catalog, general, alternative: [] });
    if (!body) return null;

    return {
        domain,
        companyId: String(bitrix.company?.ID ?? ''),
        dealId: String(dealId),
        providerId: Number(provider.id) || 0,
        recipient: recipientOf(state),
        userId: Number(bitrix.user?.ID) || 0,
        contractStart: state.contractDocument.dealFields['contract_start'] ?? '',
        contractEnd: state.contractDocument.dealFields['contract_end'] ?? '',
        complect: body.complect,
        supply: body.supply,
        contract: body.contract,
        regions: buildDocRegions(catalog, main.composition),
        otherProviders: buildOtherProviders(state),
        total: body.total,
    };
};
