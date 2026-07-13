// Доменные алиасы портальных единиц измерения (`portal_measure`) и их мониторинга.
// UI и хуки импортируют только отсюда — переименование на бэке трогает лишь этот файл.
import type {
    BxMeasureDto,
    MeasureResponseDto,
    PbxMeasureDto,
    PbxMeasureMonitoringResponseDto,
    PortalMeasureResponseDto,
    PortalMeasureSyncResponseDto,
    UpdatePortalMeasureDto,
} from '@workspace/nest-pbx-install-api';

/** Портальная единица измерения (строка `portal_measure`). */
export type PortalMeasure = PortalMeasureResponseDto;
/** Глобальная единица измерения (`measures`) — мастер-данные для портала. */
export type GlobalMeasure = MeasureResponseDto;
/** Единица измерения из Bitrix клиента (нормализованная). */
export type BitrixMeasure = BxMeasureDto;
/** Сопоставленная единица измерения: PortalDB ↔ Bitrix по ключу. */
export type MergedMeasure = PbxMeasureDto;
/** Сводка единиц измерения портала (merged + хвосты + глобальный справочник). */
export type PortalMeasureMonitoring = PbxMeasureMonitoringResponseDto;
/** Результат синхронизации портальных единиц измерения с глобальными. */
export type PortalMeasureSync = PortalMeasureSyncResponseDto;
/** Тело частичного обновления портальной единицы измерения. */
export type PortalMeasureUpdate = UpdatePortalMeasureDto;

/** Метаданные одной колонки таблицы портальных единиц измерения. */
export interface PortalMeasureColumn {
    /** Ключ поля в {@link PortalMeasure}. */
    key: keyof PortalMeasure;
    /** Человекочитаемая подпись колонки. */
    label: string;
}

/** Состав и порядок колонок таблицы портальных единиц измерения. */
export const PORTAL_MEASURE_COLUMNS: PortalMeasureColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'measure_id', label: 'ID глоб. ед.' },
    { key: 'bitrixId', label: 'Bitrix ID' },
    { key: 'name', label: 'Наименование' },
    { key: 'shortName', label: 'Краткое' },
    { key: 'fullName', label: 'Полное' },
];
