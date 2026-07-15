import type {
    BxCallingRecordDto,
    BxRecordsByCompanyRequestDto,
} from '@workspace/nest-event-sales-api';

// Ре-маппинг generated DTO → доменные алиасы (правило CLAUDE.md).
export type EvCallingRecordDto = BxCallingRecordDto;
export type EvRecordsByCompanyDto = BxRecordsByCompanyRequestDto;

/** Запись звонка в состоянии приложения (+ клиентский флаг воспроизведения). */
export interface EVCallingRecord extends BxCallingRecordDto {
    isPlaying: boolean;
}
