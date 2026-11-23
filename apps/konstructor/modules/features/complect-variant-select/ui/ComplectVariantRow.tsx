'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
    COMPLECT_VARIANT_STAGE,
    COMPLECT_VARIANT_STAGE_TITLE,
    COMPLECT_VARIANT_STAGE_TONE,
    isFinalVariantStage,
    type ComplectVariantRecordDto,
} from '@/modules/entities/complect-variant';
import type { ComplectVariantsState } from '../hooks/use-complect-variants';
import { ComplectVariantDeleteAction } from './ComplectVariantDeleteAction';

export interface ComplectVariantRowProps {
    record: ComplectVariantRecordDto;
    variants: ComplectVariantsState;
}

/**
 * Строка варианта. Бейдж стадии показывает подпись и цвет любой из
 * одиннадцати стадий; вариант в финальной стадии (Успех, Отклонён, Не
 * состоялся) приглушён, и «Отклонить» у него скрыто. Открытый вариант помечен
 * бейджем «Сейчас редактируется»: правки сборки и сохранение сделки идут в
 * него. Остальные открываются в редактор кнопкой «Редактировать». «Сделать
 * текущим» меняет стадию (кто участвует в КП и уезжает в отдел сервиса) и
 * показывается только тогда, когда состав участников от неё меняется.
 * «Удалить» убирает вариант насовсем, с подтверждением; у открытого варианта
 * оно недоступно.
 */
export const ComplectVariantRow = ({ record, variants }: ComplectVariantRowProps) => {
    const variantSmartId = record.variantSmartId;
    const stage = variants.stageOf(variantSmartId);
    const isOpen = variantSmartId !== null && variantSmartId === variants.openVariantSmartId;
    const isFinal = isFinalVariantStage(stage);

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-2 text-sm',
                isFinal && 'opacity-50',
            )}
        >
            <span className={cn(isOpen && 'font-semibold')}>{variants.titleOf(record)}</span>
            <ToneBadge tone={COMPLECT_VARIANT_STAGE_TONE[stage]} variant="soft" size="sm">
                {COMPLECT_VARIANT_STAGE_TITLE[stage]}
            </ToneBadge>
            {isOpen ? (
                <>
                    <ToneBadge
                        tone="primary"
                        variant="soft"
                        size="sm"
                        title="Правки сборки и сохранение сделки пишутся в этот вариант"
                    >
                        Сейчас редактируется
                    </ToneBadge>
                    <Button
                        size="sm"
                        variant="ghost"
                        title="Закрыть вариант: дальше правки идут только в саму сделку"
                        disabled={variants.isBusy}
                        onClick={() => void variants.close()}
                    >
                        Закрыть
                    </Button>
                </>
            ) : (
                <Button
                    size="sm"
                    variant="ghost"
                    title="Открыть вариант в конструкторе: правки пойдут в него"
                    disabled={variants.isBusy}
                    onClick={() => void variants.open(record)}
                >
                    Редактировать
                </Button>
            )}
            {variantSmartId !== null && variants.canMakeCurrent(variantSmartId) ? (
                <Button
                    size="sm"
                    variant="ghost"
                    title="В КП и в отдел сервиса идут варианты, отмеченные в работу: «Текущий» и стадии после него"
                    disabled={variants.isBusy}
                    onClick={() =>
                        void variants.setStage(variantSmartId, COMPLECT_VARIANT_STAGE.current)
                    }
                >
                    Сделать текущим
                </Button>
            ) : null}
            {variantSmartId !== null && variants.canReject(variantSmartId) ? (
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={variants.isBusy}
                    onClick={() =>
                        void variants.setStage(variantSmartId, COMPLECT_VARIANT_STAGE.rejected)
                    }
                >
                    Отклонить
                </Button>
            ) : null}
            <ComplectVariantDeleteAction record={record} variants={variants} />
        </div>
    );
};
