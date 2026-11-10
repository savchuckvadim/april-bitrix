import { PBX_SALES_KONSTRUCTOR_FIELDS } from '@workspace/pbx-data/entities/field/type/sales/konstructor/pbx-sales-konstructor-field.type';
import type { Catalog } from '@/modules/entities/catalog';
import type { KRow } from '@/modules/entities/row-set';

/** Что не записалось в сделку и где это поправить. */
export interface DealSendWarning {
    /** Название поля сделки */
    field: string;
    problem: string;
    /** Где поправить данные портала */
    fix: string;
}

/** Ответ бэка по незаписанному полю; title приходит с бэка начиная с 10.11. */
export interface SkippedField {
    code: string;
    reason: string;
    title?: string;
}

const PBX_DEAL_FIELDS = 'Админка → Портал → PBX → Сделка';

const REASONS: Record<string, Pick<DealSendWarning, 'problem' | 'fix'>> = {
    not_on_portal: {
        problem: 'поля нет на портале',
        fix: `${PBX_DEAL_FIELDS}: установить поле`,
    },
    unknown_item: {
        problem: 'на портале нет такого пункта списка',
        fix: `${PBX_DEAL_FIELDS}: обновить пункты поля из Битрикса`,
    },
    ambiguous_code: {
        problem: 'коду соответствует несколько полей',
        fix: 'Передать разработчику: в запросе нет appType',
    },
    inn_protected: {
        problem: 'ИНН этой кнопкой не меняется',
        fix: 'ИНН правится в карточке компании',
    },
};

const canonName = (code: string): string =>
    PBX_SALES_KONSTRUCTOR_FIELDS.find(field => field.code === code)?.name ?? code;

/** Ответ бэка → строки предупреждения с адресом правки. */
export const toDealSendWarnings = (skipped: readonly SkippedField[]): DealSendWarning[] =>
    skipped.map(item => ({
        field: item.title || canonName(item.code),
        ...(REASONS[item.reason] ?? { problem: item.reason, fix: PBX_DEAL_FIELDS }),
    }));

/**
 * Договор без пункта «Тип договора» (bitrixItemId = 0): фронт поле не шлёт,
 * чтобы не стереть значение в сделке, и говорит, где пункт привязать.
 */
export const contractTypeWarning = (catalog: Catalog, mainRow: KRow): DealSendWarning | null => {
    const contract = catalog.contracts.byCode[mainRow.refs.contractCode];
    if (!contract || contract.bitrixItemId) return null;
    return {
        field: canonName('contract_type'),
        problem: `у договора «${contract.name}» нет пункта списка с ID Битрикса`,
        fix:
            'Админка → Портал → Конструктор → Договоры: «Тип сделки (item)»; ' +
            `выбран — ${PBX_DEAL_FIELDS}: обновить пункты поля «Тип договора»`,
    };
};
