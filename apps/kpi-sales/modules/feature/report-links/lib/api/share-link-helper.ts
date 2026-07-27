import {
    getShareLink,
    CreateShareLinkDto,
    ShareLinkDto,
    ShareLinkListRequestDto,
    ShareLinkListResponseDto,
    ShareLinkTokenRequestDto,
    UpdateShareLinkDto,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Обёртка сгенерированного клиента тега share-link (публичные ссылки
 * на отчёт). Единственное место импорта generated-функций фичи.
 */
export class ShareLinkHelper {
    private api: ReturnType<typeof getShareLink>;

    constructor() {
        this.api = getShareLink();
    }

    // token — форвард-декларация клиентского токена (бэк уже принимает;
    // после `pnpm generate` пересечение убрать — поле войдёт в generated DTO)
    async create(
        dto: CreateShareLinkDto & { token?: string },
    ): Promise<ShareLinkDto> {
        return (await this.api.shareLinkCreate(dto)) as ShareLinkDto;
    }

    async list(dto: ShareLinkListRequestDto): Promise<ShareLinkDto[]> {
        const response = (await this.api.shareLinkList(
            dto,
        )) as ShareLinkListResponseDto;
        return response?.links ?? [];
    }

    async revoke(dto: ShareLinkTokenRequestDto): Promise<ShareLinkDto> {
        return (await this.api.shareLinkRevoke(dto)) as ShareLinkDto;
    }

    async refresh(dto: ShareLinkTokenRequestDto): Promise<ShareLinkDto> {
        return (await this.api.shareLinkRefresh(dto)) as ShareLinkDto;
    }

    async update(dto: UpdateShareLinkDto): Promise<ShareLinkDto> {
        return (await this.api.shareLinkUpdate(dto)) as ShareLinkDto;
    }
}
