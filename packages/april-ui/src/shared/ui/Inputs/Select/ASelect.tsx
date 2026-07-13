import { ElementType, ReactNode } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import ALabel from '../Label/ALabel';
import AIcon from '../../FuncIcon/FuncIcon';
import { getGroupConfig } from './lib/aselect-util';
import { Selectable } from './aselect-type';

interface ASelectProps<T extends Selectable> {
    label?: string;
    withLabel?: boolean;
    nameForHandler: string;
    errorMessage?: string | null;
    handleChange: (type: any, value: any) => void;
    current?: T;
    items: T[];
    withAction?: ReactNode;
    action?: (props: any) => any;
    actionProps?: any;
    actionType?: 'add' | 'cancel' | 'done' | 'delete' | 'update';
    ActionComponent?: ElementType;
    actionComponentProps?: any;
}

const ASelect = <T extends Selectable>({
    label,
    withLabel = true,
    errorMessage,
    nameForHandler,
    handleChange,
    current,
    items,
    withAction,
    ActionComponent,
    actionComponentProps,
    action,
    actionProps,
    actionType,
}: ASelectProps<T>) => {
    const id = `input-${label}-select-${nameForHandler}`;
    const currentConfig = current ? getGroupConfig(current) : null;
    const value = current && currentConfig ? String(currentConfig.getId(current)) : 'default';

    return (
        <div className="w-full">
            {withLabel && <ALabel htmlId={id} label={label ?? null} errorMessage={errorMessage} />}
            <div className="flex items-center gap-2">
                <Select value={value} onValueChange={v => handleChange(nameForHandler, v)}>
                    <SelectTrigger id={id} className="w-full">
                        <SelectValue placeholder="Не выбран" />
                    </SelectTrigger>
                    <SelectContent>
                        {!current && <SelectItem value="default">Не выбран</SelectItem>}
                        {items.map(item => {
                            const config = getGroupConfig(item);
                            if (!config) return null;
                            return (
                                <SelectItem key={config.getId(item)} value={String(config.getId(item))}>
                                    {config.getName(item)}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                {withAction && (
                    <div className="shrink-0">
                        {!ActionComponent ? (
                            <AIcon action={() => action?.(true)} type={actionType ?? 'add'} actionProps={actionProps} />
                        ) : (
                            <ActionComponent {...actionComponentProps} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ASelect;
