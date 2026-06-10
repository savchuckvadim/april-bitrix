'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { BxRqEditModal } from './BxRqEditModal';
import {
    EvsRqItem,
    RqItem,
    useBxRqEditBase,
    useBxRq,
} from '@workspace/bx-rq';
import { Edit2,  } from 'lucide-react';
// import { useApp } from '@/modules/app';
// import { useClientType } from '@/modules/features/client-type/hook/useClientType';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useApp } from '@/modules/app/lib/hooks/app';
import { useClientType } from '@/modules/feature/client-type/hook/useClientType';

interface BxRqBaseEditProps {
    rq: EvsRqItem;
    fields: RqItem[];
    isEmpty: boolean;
    // currentClientType: RQ_TYPE
    // contractType: CONTRACT_LTYPE
    // supplyType: SupplyTypesType
    onSave: (fields: RqItem[]) => void;
    onCancel: () => void;
    isLoading?: boolean;
    percent: number;
}

export const BxRqBaseEdit = ({
    // rq,
    fields,
    isEmpty,
    percent,
    // currentClientType,
    // contractType,
    // supplyType,
    // onSave,
    // onCancel,
    // isLoading = false
}: BxRqBaseEditProps) => {

    const {
        creating,
        isCreatingLoading,
        cancelBaseCreating,
        initBaseCreating,
        saveBase,
        setBaseProp,
        blurCase,
        getBankCommentValue,
    } = useBxRqEditBase();
    // const [isEditMode, setIsEditMode] = useState(false)

    const { domain, companyId } = useApp();
    const dispatch = useAppDispatch();
    const { clientType } = useClientType();
    const bxrqState = useAppSelector(
        state =>
            state.bxrq,
    );
    const simpleBankComment = bxrqState.creating?.simpleBankComment ?? '';
    const isSimpleBankCommentMode =
        bxrqState.settings?.isSimpleBankCommentMode ?? false;
    const saveError = bxrqState.errors?.save ?? null;

    const { isLoading, current } = useBxRq();
    const bankCommentValue = getBankCommentValue(current.item);
    // const [editedFields, setEditedFields] = useState<RqItem[]>(creating.fields)
    // const handleFieldChange = (code: string, value: string) => {
    //   setEditedFields(prev =>
    //     prev.map(field =>
    //       field.code === code
    //         ? { ...field, value: value as any }
    //         : field
    //     )
    //   )
    // }
    if (!clientType) return null;
    const handleSave = () => {
        saveBase(domain, companyId, clientType);

        //TODO: set current rq to deal

        // setIsEditMode(false)
    };

    const handleCancel = () => {
        dispatch({
            type: 'bxrq/setSimpleBankComment',
            payload: { value: bankCommentValue },
        });
        cancelBaseCreating();
        // setIsEditMode(false)
    };

    const handleEdit = () => {
        // setIsEditMode(true)
        dispatch({
            type: 'bxrq/setSimpleBankComment',
            payload: { value: bankCommentValue },
        });
        initBaseCreating(clientType);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>Основная информация</span>
                            {!isEmpty && (
                                <Badge
                                    variant="secondary"
                                    className={
                                        percent > 75
                                            ? 'bg-green-500'
                                            : percent > 20
                                              ? 'bg-yellow-500'
                                              : 'bg-red-500'
                                    }
                                >
                                    Заполнено {percent}%
                                </Badge>
                            )}
                        </div>
                        {!isEmpty && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleEdit}
                                disabled={isCreatingLoading}
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Редактировать
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!isEmpty && current.item ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fields.map(field => (
                                <div key={field.code} className="space-y-1">
                                    <label className="text-sm text-muted-foreground">
                                        {field.name}
                                    </label>
                                    <div className="text-sm font-medium">
                                        {(field.value as string) || (
                                            <span className="text-muted-foreground">
                                                Не заполнено
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isSimpleBankCommentMode && (
                                <div className="space-y-1">
                                    <label className="text-sm text-muted-foreground">
                                        Прочие реквизиты
                                    </label>
                                    <div className="text-sm font-medium whitespace-pre-wrap break-words">
                                        {bankCommentValue || (
                                            <span className="text-muted-foreground">
                                                Не заполнено
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-6">
                            <p className="text-muted-foreground">
                                Реквизиты отсутствуют
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEdit}
                                className="mt-2"
                                disabled={isCreatingLoading || isLoading}
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Добавить реквизиты
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {creating && creating.fields && creating.fields.length > 0 && (
                <BxRqEditModal
                    title="Редактирование основной информации"
                    fields={creating.fields}
                    isOpen={!!creating}
                    isLoading={isCreatingLoading}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onFieldChange={setBaseProp}
                    onFieldBlur={blurCase}
                    type="base"
                    isSimpleBankCommentMode={isSimpleBankCommentMode}
                    simpleBankCommentValue={simpleBankComment}
                    onSimpleBankCommentChange={value =>
                        dispatch({
                            type: 'bxrq/setSimpleBankComment',
                            payload: { value },
                        })
                    }
                    submitError={saveError}
                />
            )}
        </>
    );
};
