import { createAsyncThunk } from '@reduxjs/toolkit';
import { IOfferTemplate } from '../type/offer-template.type';
import { RootState } from '@/modules/app';
import { BlockType, CreateOfferTemplatePageBlockRequestDto, CreateOfferTemplatePageRequestDto, CreateOfferTemplatePageStickerDto, CreateOfferTemplateRequestDto, OfferTemplateSummaryDto, OfferTemplateVisibility } from '@workspace/nest-api';
import { getKonstructorOfferTemplate } from '@workspace/nest-api/src/generated/konstructor-offer-template/konstructor-offer-template';


export const fetchOfferTemplates = createAsyncThunk<
    OfferTemplateSummaryDto[], // return type
    void, // argument type
    {
        state: RootState;
        rejectValue: string;
        extra: { getWSClient: () => void };
    }
>(
    'offerTemplate/fetchTemplates',
    async (_, { getState, rejectWithValue, extra }) => {
        try {

            const nestApi = getKonstructorOfferTemplate();

            const templates = await nestApi.offerTemplateFindAllOfferTemplate({

                visibility: OfferTemplateVisibility.public,
                portal_id: '1',
                is_active: true,
                search: '',

            })

            return templates;
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка загрузки');
        }
    },
);


export const saveOfferTemplateThunk = createAsyncThunk<
    IOfferTemplate, // return type
    IOfferTemplate, // argument type
    {
        state: RootState;
        rejectValue: string;
        extra: { getWSClient: () => void };
    }
>(
    'offerTemplate/save',
    async (template, { getState, rejectWithValue, extra }) => {
        try {
            const {
                pages
            } = template;

            const state = getState() as RootState;


            const pagesData = pages.map(page => ({
                ...page,
                offer_template_id: 0,
                code: '',
                is_active: true,
                settings: '',
                stickers: '',
                background: '',
                colors: '',
                fonts: '',
                stickers_items: [] as CreateOfferTemplatePageStickerDto[],

                blocks: page.blocks.map(block => ({
                    ...block,
                    type: block.type as BlockType,
                    background: '',
                    stickers: '',
                    settings: '',

                    code: '',
                    colors: '',
                    content: JSON.stringify(block.content),

                }) as CreateOfferTemplatePageBlockRequestDto),
            }) as CreateOfferTemplatePageRequestDto)

            const createOfferTemplateDto = {

                domain: state.app.domain,
                name: '',
                pages: pagesData,
                fonts: [],
                visibility: 'public',
                is_default: false,
                file_path: '',
                demo_path: '',
                type: 'template',
                price_settings: '',
                infoblock_settings: '',
                letter_text: '',
                sale_text_1: '',
                sale_text_2: '',
                sale_text_3: '',
                sale_text_4: '',
                sale_text_5: '',
                field_codes: '',
                style: '',
                color: '',
                code: 'test_userId_',
                tags: '',
                is_active: true,
                counter: 0,
            } as CreateOfferTemplateRequestDto


            const nestApi = getKonstructorOfferTemplate();
            const nestApiData = await nestApi.offerTemplateCreateOfferTemplate(createOfferTemplateDto)

            console.log(nestApiData);

            // Проходимся по всем страницам и блокам созданного шаблона
            for (const page of nestApiData.pages as CreateOfferTemplatePageRequestDto[]) {
                for (const block of page.blocks) {
                    // ищем в оригинальных данных тот блок, где есть File


                    //TODO: Добавить загрузку картинки для блока

                    // const { imageId, imageUrl } = await uploadBlockImage(block.id, file);


                }

            }


            return template;
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка загрузки');
        }
    },
);



async function uploadBlockImage(blockId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("blockId", String(blockId)); // укажем, к какому блоку относится картинка

    const res = await fetch("/api/offer-template-blocks/upload-image", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Ошибка загрузки файла");
    return await res.json(); // { imageId: number, imageUrl: string }
}

