import type { Catalog, KComplect } from '../../../../catalog';
import { getComplectRuleFlags, LT_CODE_WEIGHT } from '../../../../catalog';
import type { Composition } from '../../../model/types';

/**
 * Вес LT-сервиса: источник истины — каталог (БД). Пакет складывается из весов,
 * поэтому 0 читаем как «вес не заполнен» и не даём ему обнулить пакет;
 * статическая таблица — fallback для тестов и маппинга легаси-слепков.
 */
export const ltServiceWeight = (code: string, catalog?: Catalog): number =>
    catalog?.services.lt.find(service => service.code === code)?.weight ||
    LT_CODE_WEIGHT[code] ||
    1;

export const ltWeightOf = (codes: readonly string[], catalog?: Catalog): number =>
    codes.reduce((sum, code) => sum + ltServiceWeight(code, catalog), 0);

export const ltPacketWeight = (composition: Composition, catalog?: Catalog): number =>
    ltWeightOf(composition.ltInPacket, catalog);

/** Занятые бесплатные места: сумма весов бесплатных сервисов (ЧекДок Премиум = 2) */
export const ltFreeWeight = (composition: Composition, catalog?: Catalog): number =>
    ltWeightOf(composition.lt, catalog);

/**
 * Лимит бесплатных: вес LT, привязанного к комплекту в админке. У большинства
 * проф. комплектов 2, у Офиса и Эксперта в Закупках 5, у универсальных 0.
 */
export const ltFreeLimit = (complect: KComplect, catalog?: Catalog): number =>
    getComplectRuleFlags(complect).ltDefaultsPaid ? 0 : ltWeightOf(complect.defaults.lt, catalog);
