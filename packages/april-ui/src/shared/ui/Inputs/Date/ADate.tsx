import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';
import ALabel from '../Label/ALabel';

interface ADateProps<T> {
    label: string | null;
    value?: string;
    errorMessage?: string | null;
    nameForHandler: T;
    isOnlyDate?: boolean;
    handleChange: (type: T, value: string) => void;
    handleOnFocus?: (code: any, error: string) => void;
}

const ADate = <T extends string | number>({
    label,
    value,
    errorMessage,
    nameForHandler,
    isOnlyDate = false,
    handleChange,
    handleOnFocus,
}: ADateProps<T>) => {
    const id = `input-${nameForHandler}`;

    return (
        <div className="w-full">
            {label && <ALabel htmlId={id} label={label} errorMessage={errorMessage} />}
            <Input
                id={id}
                lang="rus"
                type={isOnlyDate ? 'date' : 'datetime-local'}
                defaultValue={value}
                onChange={e => handleChange(nameForHandler, e.target.value)}
                onFocus={() => handleOnFocus && handleOnFocus(nameForHandler, errorMessage ?? '')}
                className={cn(errorMessage && 'border-red-500 focus-visible:ring-red-500')}
            />
        </div>
    );
};

export default ADate;
