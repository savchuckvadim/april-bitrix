import { FC } from 'react';
import { Textarea } from '@workspace/ui/components/textarea';
import { cn } from '@workspace/ui/lib/utils';
import ALabel from '../Label/ALabel';

interface ATextProps {
    label: string | null;
    height: number;
    nameForHandler: any;
    errorMessage?: string;
    current?: string;
    isDisabled?: boolean;
    handleChange: (value: string) => void;
    handleBlur: () => void;
}

const AText: FC<ATextProps> = ({
    label,
    height,
    nameForHandler,
    errorMessage,
    current,
    isDisabled,
    handleChange,
    handleBlur,
}) => {
    const id = `input-${nameForHandler}`;
    return (
        <div className="w-full">
            {label && <ALabel htmlId={id} label={label} errorMessage={errorMessage} />}
            <Textarea
                id={id}
                disabled={isDisabled}
                rows={height}
                lang="rus"
                value={current}
                onChange={e => handleChange(e.target.value)}
                onBlur={handleBlur}
                className={cn(errorMessage && 'border-red-500 focus-visible:ring-red-500')}
            />
        </div>
    );
};

export default AText;
