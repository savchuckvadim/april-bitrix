import type { SmartResponseDto } from '@workspace/nest-admin-api';
import type { SmartName, TypedGroup } from '../../../lib/model/common';

/** Источник карточки галереи смартов. */
export type SmartGallerySource = 'const' | 'excel' | 'manual';

/**
 * Карточка «единой галереи смартов»: merge строк `smarts` портала (PortalDB),
 * реестра const-смартов и эталонного набора Excel-смартов (SMART_NAMES) с
 * best-effort обогащением из мониторинга pbx-install.
 */
export interface SmartGalleryCard {
    /** Уникальный ключ карточки (`db-{id}` / `const-{kind}` / `tpl-{name}`). */
    key: string;
    /** Человекочитаемое название карточки. */
    title: string;
    /** `smarts.name` установленной строки либо код эталона. */
    name: string;
    /** `smarts.group` (для неустановленных эталонов — группа шаблонных). */
    group: string;
    /** `smarts.type` установленной строки либо type из const-реестра. */
    type?: string;
    /** Откуда смарт: const-эталон / excel-эталон / ручной (вне эталонов). */
    source: SmartGallerySource;
    /** Есть ли строка в `smarts` портала (PortalDB). */
    installed: boolean;
    /** Найден ли смарт в Bitrix-части мониторинга (best-effort, excel). */
    inBitrix?: boolean;
    /** entityTypeId в CRM (из строки БД либо из мониторинга). */
    entityTypeId?: number | string;
    /** Число полей (const — по эталону; excel — из мониторинга). */
    fieldCount?: number;
    /** Число воронок (best-effort из мониторинга). */
    funnelCount?: number;
    /** Число стадий (best-effort из мониторинга). */
    stageCount?: number;
    /** Строка `smarts` из PortalDB (только для installed). */
    dbSmart?: SmartResponseDto;
    /** Параметры полной установки по эталону (только для excel). */
    template?: { name: SmartName; group: TypedGroup };
    /** `kind` const-смарта для `POST install-const` (только для const). */
    constKind?: string;
}
