import type {
    OtherProvidersDto,
    ProviderOtherFieldDto,
    RecipientDto,
    ZakupkiOfferCreateDto,
    ZakupkiProviderFieldDto,
    ZakupkiSettingsDto,
    ZakupkiSettingsSaveDto,
} from '@workspace/nest-konstructor-api';

/**
 * Алиасы generated DTO (паттерн CLAUDE.md): слайс, thunk и UI знают только
 * их — переименование на бэке трогает этот файл и helper.
 */
export type ZakupkiSettings = ZakupkiSettingsDto;
export type ZakupkiProviderField = ZakupkiProviderFieldDto;
export type ZakupkiProviderKey = keyof ZakupkiSettingsDto['providers'];
export type ZakupkiSettingsSave = ZakupkiSettingsSaveDto;
export type ZakupkiOfferRequest = ZakupkiOfferCreateDto;
export type ZakupkiOtherProviders = OtherProvidersDto;
export type ZakupkiOtherProviderField = ProviderOtherFieldDto;
export type ZakupkiRecipient = RecipientDto;
