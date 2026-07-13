import { FC } from 'react';
import { Label } from '@workspace/ui/components/label';
import { cn } from '@workspace/ui/lib/utils';

interface ALabelProps {
    htmlId: string;
    label: string | null;
    errorMessage?: string | null;
}

const ALabel: FC<ALabelProps> = ({ htmlId, label, errorMessage }) => {
    return (
        <Label
            htmlFor={htmlId}
            className={cn(
                'mb-1 block text-sm font-medium',
                errorMessage ? 'text-red-500' : 'text-foreground',
            )}
        >
            {errorMessage ? errorMessage : label}
        </Label>
    );
};

export default ALabel;
