import type {
    ComplectCompositionDto,
    DocumentVariantDto,
    OfferWordByTemplateGenerateDto,
} from '@workspace/nest-konstructor-api';

/**
 * Тело превью PDF по Word-шаблону: то же, что у формирования КП, плюс
 * необязательные участники-варианты и настройки сделки (форма как у
 * generate-multi). Участников нет — поля не передаются.
 *
 * Бэк принимает `variants` и `composition` в превью; в сгенерированном
 * клиенте этих полей у превью пока нет. После `pnpm run generate` они
 * появятся в OfferWordByTemplateGenerateDto, и расширение ниже можно убрать.
 */
export type OfferWordPreviewRequest = OfferWordByTemplateGenerateDto & {
    variants?: DocumentVariantDto[];
    composition?: ComplectCompositionDto;
};
