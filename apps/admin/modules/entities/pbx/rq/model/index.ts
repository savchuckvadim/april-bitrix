import type {
    RqMonitoringResponseDto,
    RqParseResponseDto,
    RqPresetMonitorRowDto,
    RqFieldMonitorRowDto,
    RqDeleteResultDto,
    InstallRqResultDto,
    InstallRqPresetDto,
    InstallRqFieldDto,
    SetRqPresetBitrixIdDtoCode,
    PortalRqResponseDto,
} from '@workspace/nest-pbx-install-api';

/** Смерженное состояние реквизитов: эталон × Bitrix × PortalDB. */
export type RqMonitoring = RqMonitoringResponseDto;
/** Эталон для предпросмотра перед установкой (parse). */
export type RqParse = RqParseResponseDto;

/** Строка статуса пресета (эталон × Bitrix × БД `bx_rqs`). */
export type RqPresetRow = RqPresetMonitorRowDto;
/** Строка статуса пользовательского поля реквизита (эталон × Bitrix). */
export type RqFieldRow = RqFieldMonitorRowDto;

/** Результат точечного удаления (deleted[] / failed[]). */
export type RqDeleteResult = RqDeleteResultDto;
/** Результат установки (presets[] + fields[]). */
export type InstallRqResult = InstallRqResultDto;

/** Эталонный пресет (тело установки). */
export type RqPresetTemplate = InstallRqPresetDto;
/** Эталонное поле реквизита (тело установки). */
export type RqFieldTemplate = InstallRqFieldDto;

/** Бизнес-код пресета (preset_org / preset_ip / preset_fiz). */
export type RqPresetCode = SetRqPresetBitrixIdDtoCode;
/** Строка зеркала пресета в БД (`bx_rqs`). */
export type RqPortalPreset = PortalRqResponseDto;
