import { useEffect, useState } from 'react';
import { FieldInput } from '@workspace/ui/shared';

interface AInputProps<T> {
    label: string | null;
    errorMessage: string | null;
    nameForHandler: T;
    value?: string;
    handleChange: (type: T, value: string) => void;
    handleOnFocus: (code: T, error: string | null) => void;
    validateInput?: (type: T, value: string) => string | null;
}

const AInput = <T extends string | number>({
    label,
    errorMessage,
    nameForHandler,
    value,
    handleChange,
    handleOnFocus,
}: AInputProps<T>) => {
    const id = `input-${nameForHandler}`;
    const [localError, setLocalError] = useState<string | null>(errorMessage);

    useEffect(() => {
        setLocalError(errorMessage);
    }, [errorMessage]);

    return (
        <FieldInput
            id={id}
            label={label ?? undefined}
            error={localError ?? undefined}
            value={value ?? ''}
            onChange={e => {
                if (localError) setLocalError('');
                handleChange(nameForHandler, e.target.value);
            }}
            onFocus={() => handleOnFocus(nameForHandler, localError)}
        />
    );
};

export default AInput;
