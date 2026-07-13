import { useEffect, useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';
import ALabel from '../Label/ALabel';

interface AInputProps<T> {
    label: string | null;
    errorMessage: string | null;
    nameForHandler: T;
    currentValue?: string | null;
    handleChange: (type: T, value: string) => void;
    handleOnFocus: (code: T, error: string) => void;
}

const APhoneInput = <T extends string | number | 'EMAIL' | 'PHONE'>({
    label,
    currentValue = '',
    errorMessage,
    nameForHandler,
    handleChange,
}: AInputProps<T>) => {
    const id = `input-${nameForHandler}`;
    const [localError, setLocalError] = useState<string | null>(errorMessage);

    let type = 'text';
    if (nameForHandler === 'EMAIL') type = 'email';
    if (nameForHandler === 'PHONE') type = 'tel';

    const validate = (value: string) => {
        if (nameForHandler === 'PHONE') {
            const parsed = parsePhoneNumberFromString(value, 'RU');
            setLocalError(!parsed || !parsed.isValid() ? 'Некорректный телефон' : null);
        }
    };

    useEffect(() => {
        setLocalError(errorMessage);
    }, [errorMessage]);

    return (
        <div className="w-full">
            {label && <ALabel htmlId={id} label={label} errorMessage={localError} />}
            <Input
                id={id}
                type={type}
                lang="rus"
                defaultValue={currentValue ?? ''}
                onChange={e => {
                    if (localError) setLocalError('');
                    handleChange(nameForHandler, e.target.value);
                }}
                onBlur={e => validate(e.target.value)}
                className={cn(localError && 'border-red-500 focus-visible:ring-red-500')}
            />
        </div>
    );
};

export default APhoneInput;
