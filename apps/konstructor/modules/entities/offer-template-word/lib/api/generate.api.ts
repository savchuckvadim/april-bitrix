import {  getKonstructor, getKonstructorWordTemplate, getKonstructorWordTemplateTags, OfferWordByTemplateGenerateDto, OfferWordByTemplateGenerateResponseDto } from "@workspace/nest-api";

export class OfferWordGenerateAPI {
    private api: ReturnType<typeof getKonstructor>;
    constructor() {
        this.api = getKonstructor();
    }

    public async generate(request: OfferWordByTemplateGenerateDto): Promise<OfferWordByTemplateGenerateResponseDto> {
        return this.api.offerWordGenerateGenerateOfferWord(request);
    }
}
