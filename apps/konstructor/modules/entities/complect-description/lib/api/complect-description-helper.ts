import { getKonstructorComplectDescription } from '@workspace/nest-konstructor-api';
import type { ComplectDescriptionRequest, ComplectDescriptionResponse } from '../../model/dto';

/** Единственное место со сгенерированным клиентом «Описания комплекта». */
export class ComplectDescriptionHelper {
    private api = getKonstructorComplectDescription();

    async generate(dto: ComplectDescriptionRequest): Promise<ComplectDescriptionResponse> {
        return this.api.complectDescriptionGenerate(dto);
    }
}
