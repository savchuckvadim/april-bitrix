import {
    CreateWordTemplateMultipartDto,
    CreateWordTemplateResponseDto,
    UpdateWordTemplateDto,
    WordTemplateDto,
    // WordTemplateDtoVisibility,
    WordTemplateFindAllWordTemplatesParams,
    WordTemplateSummaryDto,
    // WordTemplateSummaryDtoVisibility
} from "@workspace/nest-konstructor-api";


export interface IWordTemplateSummury extends WordTemplateSummaryDto {}
export interface IWordTemplate extends WordTemplateDto {}


export interface ICreateWordTemplateDto extends CreateWordTemplateMultipartDto {}

export interface INewWordTemplate extends CreateWordTemplateResponseDto{}

export interface IUpdateWordTemplateDto extends UpdateWordTemplateDto {}


export interface IWordTemplateFindAllParams extends WordTemplateFindAllWordTemplatesParams {}
