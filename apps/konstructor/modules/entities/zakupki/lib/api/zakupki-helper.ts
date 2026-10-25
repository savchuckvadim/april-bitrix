import {
    getKonstructor,
    getKonstructorZakupki,
    type ZakupkiOfferCreateDto,
    type ZakupkiSettingsDto,
    type ZakupkiSettingsSaveDto,
} from '@workspace/nest-konstructor-api';

/** Единственное место со сгенерированным клиентом «3 КП для торгов». */
export class ZakupkiHelper {
    private settings = getKonstructorZakupki();
    private konstructor = getKonstructor();

    /** Свои настройки → дефолт портала → создать дефолт */
    async fetch(domain: string, bxUserId: number): Promise<ZakupkiSettingsDto> {
        return this.settings.zakupkiSettingsGet({ domain, bxUserId });
    }

    async saveUser(dto: ZakupkiSettingsSaveDto): Promise<ZakupkiSettingsDto> {
        return this.settings.zakupkiSettingsSaveUser(dto);
    }

    async saveDefault(dto: ZakupkiSettingsSaveDto): Promise<ZakupkiSettingsDto> {
        return this.settings.zakupkiSettingsSaveDefault(dto);
    }

    async deleteUser(domain: string, bxUserId: number): Promise<boolean> {
        const response = await this.settings.zakupkiSettingsDeleteUser({ domain, bxUserId });
        return response.deleted;
    }

    /** Очередь генерации: ответ — operationId, документы уйдут в сделку сами */
    async generate(dto: ZakupkiOfferCreateDto): Promise<string> {
        return this.konstructor.zakupkiOfferCreateZakupkiOffer(dto);
    }
}
