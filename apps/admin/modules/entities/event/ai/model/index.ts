import type { AdminAiFindPageParams, AiEntityDto } from "@workspace/nest-admin-api";

/** AI-запись. В списке длинные поля приходят укороченными, целиком — в карточке. */
export type AiEntity = AiEntityDto;

/** Фильтры списка: всё, кроме номера и размера страницы. */
export type AiListFilters = Omit<AdminAiFindPageParams, 'page' | 'pageSize'>;
