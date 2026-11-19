'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
    COMPLECT_VARIANT_STAGE,
    COMPLECT_VARIANT_STAGE_TITLE,
    type ComplectVariantRecordDto,
} from '@/modules/entities/complect-variant';
import type { ComplectVariantsState } from '../hooks/use-complect-variants';
import { ComplectVariantDeleteAction } from './ComplectVariantDeleteAction';

export interface ComplectVariantRowProps {
    record: ComplectVariantRecordDto;
    variants: ComplectVariantsState;
}

/**
 * Строка варианта. Открытый вариант помечен бейджем «Сейчас редактируется»:
 * правки сборки и сохранение сделки идут в него. Остальные открываются в
 * редактор кнопкой «Редактировать». «Сделать текущим» меняет стадию (кто
 * участвует в КП и уезжает в отдел сервиса) и показывается только тогда, когда
 * состав участников от неё меняется. «Удалить» убирает вариант насовсем, с
 * подтверждением; у открытого варианта оно недоступно.
 */
export const ComplectVariantRow = ({ record, variants }: ComplectVariantRowProps) => {
    const variantSmartId = record.variantSmartId;
    const stage = variants.stageOf(variantSmartId);
    const isOpen = variantSmartId !== null && variantSmartId === variants.openVariantSmartId;
    const isRejected = stage === COMPLECT_VARIANT_STAGE.rejected;

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-2 text-sm',
                isRejected && 'opacity-50',
            )}
        >
            <span className={cn(isOpen && 'font-semibold')}>{variants.titleOf(record)}</span>
            <span className="text-xs text-muted-foreground">
                {COMPLECT_VARIANT_STAGE_TITLE[stage]}
            </span>
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
                    title="В КП и в отдел сервиса идут только варианты со стадией «Текущий»"
                    disabled={variants.isBusy}
                    onClick={() =>
                        void variants.setStage(variantSmartId, COMPLECT_VARIANT_STAGE.current)
                    }
                >
                    Сделать текущим
                </Button>
            ) : null}
            {variantSmartId !== null && !isRejected ? (
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
