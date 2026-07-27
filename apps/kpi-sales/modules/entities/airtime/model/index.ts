import type {
    AirtimeDirectionStatDto,
    AirtimeStatisticResponseDto,
    AirtimeUserResultDto,
    BXUserDto,
} from '@workspace/nest-kpi-report-sales-api';

/** Доменные алиасы generated DTO — бэк-переименования локализуются здесь. */
export type AirtimeReport = AirtimeStatisticResponseDto;
export type AirtimeUserRow = AirtimeUserResultDto;
export type AirtimeDirection = AirtimeDirectionStatDto;
export type AirtimeBXUser = BXUserDto;
