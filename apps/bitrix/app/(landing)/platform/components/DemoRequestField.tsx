import type { ReactNode } from 'react';
import { Label } from '@workspace/ui/components/label';

export interface DemoRequestFieldProps {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}

/** Подпись, поле и ошибка под ним — одинаково для всех полей формы. */
export function DemoRequestField({
    id,
    label,
    required = false,
    error,
    children,
}: DemoRequestFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={id}>
                {label}
                {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && (
                <p id={`${id}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
