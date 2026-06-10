import { getKonstructorWordTemplateTags } from "@workspace/nest-api";


export class OfferWordTemplateTagsAPI {
    private api: ReturnType<typeof getKonstructorWordTemplateTags>;
    constructor() {
        this.api = getKonstructorWordTemplateTags();
    }


    public async uploadDocumentTagsFile(file: File): Promise<void> {
        return this.api.wordTemplateTagsUploadDocumentTagsFile({ file });
    }

    public async downloadDocumentTagsFile(): Promise<Blob> {
        return this.api.wordTemplateTagsDownloadDocumentTagsFile();
    }

}

export const wordTemplateTagsHttp = new OfferWordTemplateTagsAPI();

