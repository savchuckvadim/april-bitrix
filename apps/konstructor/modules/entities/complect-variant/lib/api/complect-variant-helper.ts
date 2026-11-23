import { customAxios, getKonstructorDeal } from '@workspace/nest-konstructor-api';
import type { IBXItem } from '@bitrix/index';
import { Bitrix } from '@bitrix/bitrix';
import { findInnerDeal } from '../../../snapshot/lib/api/inner-deal-find-helper';
import type { SnapshotV2 } from '../../../snapshot/model/types';
import type {
    ComplectComposition,
    ComplectVariantDeleteParams,
    ComplectVariantDeleteResponse,
    ComplectVariantRecordDto,
} from '../../model/dto';
import { isBitrixDeleteConfirmed } from '../delete-variant';

/**
 * Элемент смарта «Варианты комплекта» в Битриксе. Нужен рядом со слепком
 * из-за стадии: участие варианта хранится колонкой канбана, а не в базе
 * конструктора.
 */
export interface ComplectVariantItem {
    id: number;
    title: string;
    stageId: string;
}

const toItem = (item: IBXItem): ComplectVariantItem => ({
    id: Number(item.id),
    title: String(item.title ?? ''),
    stageId: String(item.stageId ?? ''),
});

/**
 * Варианты комплекта: слепки — через @workspace/nest-konstructor-api,
 * элементы смарта (заголовок, стадия) — через Bitrix. ЕДИНСТВЕННОЕ место
 * импорта api-пакета для слайса вариантов.
 */
export class ComplectVariantHelper {
    private api = getKonstructorDeal();

    /** Все слепки вариантов сделки. */
    async listRecords(
        domain: string,
        dealId: number,
    ): Promise<ComplectVariantRecordDto[]> {
        return await this.api.innerDealVariants({ domain, dealId });
    }

    /**
     * Настройки сборки — из слепка самой сделки. Слепка нет — настроек нет.
     * На входе тот же запрос уже шлёт восстановление слепка: общий, второй не уходит.
     */
    async getComposition(
        domain: string,
        dealId: number,
    ): Promise<ComplectComposition | null> {
        const result = await findInnerDeal({ domain, dealId });
        return result.found ? (result.deal?.settings ?? null) : null;
    }

    /**
     * Настройки — отдельной ручкой. Не через upsert слепка: тот пишет все
     * колонки разом, и запрос с одними настройками обнулил бы комплект.
     */
    async saveComposition(
        domain: string,
        dealId: number,
        settings: ComplectComposition | null,
    ): Promise<void> {
        await this.api.innerDealUpdateSettings({ domain, dealId, settings });
    }

    /**
     * Слепок v2 под конкретный вариант — тот же upsert, что у сделки. Сервер
     * отвечает сохранённой записью: по ней слайс обновляет свой список.
     */
    async saveRecord(
        snapshot: SnapshotV2,
        variantSmartId: number,
    ): Promise<ComplectVariantRecordDto> {
        if (!snapshot.dealId) throw new Error('saveRecord: нет dealId');
        return await this.api.innerDealUpsert({
            domain: snapshot.domain,
            dealId: snapshot.dealId,
            userId: snapshot.userId,
            variantSmartId,
            templateId: snapshot.templateId,
            rows: JSON.stringify(snapshot),
        });
    }

    /**
     * Удалить слепок варианта из базы конструктора. Запрос написан руками:
     * ручка появилась после последнего прогона orval. Транспорт тот же
     * (`customAxios` разворачивает конверт бэка), так что переезд на
     * сгенерированный клиент сводится к замене этого вызова.
     */
    async deleteRecord(
        params: ComplectVariantDeleteParams,
    ): Promise<ComplectVariantDeleteResponse> {
        return await customAxios<ComplectVariantDeleteResponse>({
            url: '/api/konstructor/deal/variant',
            method: 'DELETE',
            params,
        });
    }

    /**
     * Удалить элемент смарта в Битриксе. Сбой (исключение или ответ без
     * результата) пробрасывается ошибкой: вызывающий отличает его от отказа
     * нашей базы.
     */
    async deleteItem(entityTypeId: number, itemId: number): Promise<void> {
        const result = await Bitrix.getService().item.delete(
            itemId,
            String(entityTypeId),
        );
        if (!isBitrixDeleteConfirmed(result)) {
            throw new Error('Битрикс не подтвердил удаление элемента');
        }
    }

    /** Элементы смарта, привязанные к сделке. */
    async listItems(
        entityTypeId: number,
        dealId: number,
    ): Promise<ComplectVariantItem[]> {
        const response = await Bitrix.getService().item.list(
            String(entityTypeId),
            { parentId2: dealId },
            ['id', 'title', 'stageId'],
        );
        return (response?.items ?? []).map(toItem);
    }

    /** Новый элемент смарта на сделке. null — Битрикс не создал. */
    async createItem(
        entityTypeId: number,
        dealId: number,
        title: string,
    ): Promise<ComplectVariantItem | null> {
        const response = await Bitrix.getService().item.add(
            String(entityTypeId),
            { title, parentId2: dealId },
        );
        return response?.item ? toItem(response.item) : null;
    }

    /** Перевод элемента на другую стадию. */
    async updateItemStage(
        entityTypeId: number,
        itemId: number,
        stageId: string,
    ): Promise<void> {
        await Bitrix.getService().item.update(itemId, String(entityTypeId), {
            stageId,
        });
    }
}
