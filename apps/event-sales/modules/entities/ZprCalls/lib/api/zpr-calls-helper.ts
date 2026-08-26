import { Bitrix } from '@workspace/bitrix';
import type { ZprCall, ZprRef, ZprStageDict } from '../../model';
import { mergeZprRefs, parseZprRefs } from '../zpr-ref';
import { mapZprItem } from '../zpr-item-view';
import {
    buildZprStageDict,
    zprStageEntityId,
    type RawZprStatusRow,
} from '../zpr-stage-view';

/**
 * Единственное место DAL слайса ЗПР — только типизированные вызовы
 * `@workspace/bitrix` (crm.deal/company.list, crm.item.list, crm.status.list);
 * сырых `api.call` здесь нет и быть не должно (правило владельца).
 */
export class ZprCallsHelper {
    /**
     * Свежие ссылки op_zprs сделки и компании — точечный re-read вместо
     * полного relоad сущностей: сайд-очередь дописывает обратную ссылку
     * ПОСЛЕ основного отчёта, и значения в сторе к этому моменту устаревают.
     */
    async fetchRefs(params: {
        dealId: number | null;
        companyId: number | null;
        /** Полный ключ поля (UF_CRM_OP_ZPRS) на сделке; нет поля — null. */
        dealUfKey: string | null;
        companyUfKey: string | null;
    }): Promise<ZprRef[]> {
        const bitrix = Bitrix.getService();
        const requests: Promise<ZprRef[]>[] = [];

        if (params.dealId && params.dealUfKey) {
            const key = params.dealUfKey;
            requests.push(
                bitrix.deal
                    .getList({ ID: params.dealId }, ['ID', key])
                    .then(response => {
                        const rows = (response?.result ?? []) as Array<
                            Record<string, unknown>
                        >;
                        return parseZprRefs(rows[0]?.[key]);
                    }),
            );
        }
        if (params.companyId && params.companyUfKey) {
            const key = params.companyUfKey;
            requests.push(
                bitrix.company
                    .getList({ ID: params.companyId }, ['ID', key])
                    .then(rows =>
                        parseZprRefs(
                            (rows as Array<Record<string, unknown>> | null)?.[0]?.[
                                key
                            ],
                        ),
                    ),
            );
        }

        const groups = await Promise.all(requests);
        return mergeZprRefs(...groups);
    }

    /**
     * Элементы смарта по ссылкам: один crm.item.list на entityTypeId
     * (в норме тип один; select не сужаем — элементов у клиента единицы,
     * а camel-ключи UF-полей резолвятся по фактическим ключам ответа).
     *
     * allSettled, а не all: ссылка может указывать на удалённый элемент или
     * чужой тип, и одна отвергнутая группа роняла ВЕСЬ запрос — секция ЗПР
     * пустела целиком из-за одного мёртвого ref. Живые группы отдаём,
     * мёртвые — в console.warn (fail-open).
     */
    async fetchItems(refs: ZprRef[]): Promise<ZprCall[]> {
        const bitrix = Bitrix.getService();
        const byType = new Map<number, number[]>();
        for (const ref of refs) {
            const ids = byType.get(ref.entityTypeId) ?? [];
            ids.push(ref.elementId);
            byType.set(ref.entityTypeId, ids);
        }

        const entries = [...byType.entries()];
        const settled = await Promise.allSettled(
            entries.map(async ([entityTypeId, ids]) => {
                const response = await bitrix.item.list(String(entityTypeId), {
                    id: ids,
                });
                return (response?.items ?? [])
                    .map(item =>
                        mapZprItem(
                            item as Record<string, unknown>,
                            entityTypeId,
                        ),
                    )
                    .filter((call): call is ZprCall => call !== null);
            }),
        );

        const groups: ZprCall[][] = [];
        settled.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                groups.push(result.value);
                return;
            }
            console.warn(
                'zpr fetchItems: группа entityTypeId недоступна',
                entries[index]?.[0],
                result.reason,
            );
        });
        return groups.flat();
    }

    /** Словарь стадий воронки ЗПР (crm.status.list динамического типа). */
    async fetchStageDict(
        entityTypeId: number,
        categoryId: number,
    ): Promise<ZprStageDict> {
        const bitrix = Bitrix.getService();
        const response = await bitrix.status.getList({
            ENTITY_ID: zprStageEntityId(entityTypeId, categoryId),
        });
        return buildZprStageDict(
            (response?.result ?? []) as RawZprStatusRow[],
        );
    }
}
