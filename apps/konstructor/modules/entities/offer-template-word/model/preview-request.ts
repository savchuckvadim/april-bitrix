import type { ComplectCompositionDto } from '@workspace/nest-konstructor-api';
import type { DocVariant } from '../../document-payload/model/dto';
import type { OfferWordRequest } from '../../offer-document';

/**
 * Тело превью PDF по Word-шаблону: то же, что у формирования КП, плюс
 * необязательные участники-варианты и настройки сделки (форма как у
 * generate-multi). Участников нет — поля не передаются. Разделы по комплектам
 * (`complects`) и флаг письма (`withLetter`) приходят из OfferWordRequest;
 * способа печати (`complectsMode`) у Word нет.
 *
 * Бэк принимает `variants` и `composition` в превью; в сгенерированном
 * клиенте этих полей у превью пока нет. После `pnpm run generate` они
 * появятся в OfferWordByTemplateGenerateDto, и расширение ниже можно убрать.
 */
export type OfferWordPreviewRequest = OfferWordRequest & {
    variants?: DocVariant[];
    composition?: ComplectCompositionDto;
};
