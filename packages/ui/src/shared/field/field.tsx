'use client';
import { InputHTMLAttributes, ReactNode, useState } from "react";
import {
    Control,
    Controller,
    FieldPath,
    FieldValues,
    RegisterOptions,
} from "react-hook-form";

import {
    Field as UIField,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Eye, EyeOff } from "lucide-react";

// --- Base Field (manual error / children) ---

export interface FieldProps {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    children?: ReactNode;
    className?: string;
}

export function Field({ label, error, helperText, required, children, className }: FieldProps) {
    return (
        <UIField className={cn(className)} data-invalid={error ? "true" : undefined}>
            {label && (
                <FieldLabel>
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </FieldLabel>
            )}
            <FieldContent>
                {children}
                {helperText && !error && <FieldDescription>{helperText}</FieldDescription>}
                {error && <FieldError>{error}</FieldError>}
            </FieldContent>
        </UIField>
    );
}

// --- FieldInput (manual, no Controller) ---

export interface FieldInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
}

export function FieldInput({
    label,
    error,
    helperText,
    required,
    className,
    ...inputProps
}: FieldInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = inputProps.type === "password";
    const resolvedType = isPasswordField ? (showPassword ? "text" : "password") : inputProps.type;

    return (
        <Field label={label} error={error} helperText={helperText} required={required}>
            <div className="relative">
                <Input
                    className={cn(
                        error && "border-destructive",
                        isPasswordField && "pr-10",
                        className,
                    )}
                    aria-invalid={error ? "true" : undefined}
                    {...inputProps}
                    type={resolvedType}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
        </Field>
    );
}

// --- FormField (generic Controller wrapper) ---

export interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    rules?: Omit<RegisterOptions<T, FieldPath<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    label?: string;
    helperText?: string;
    required?: boolean;
    className?: string;
    children: (field: {
        value: any;
        onChange: (...event: any[]) => void;
        onBlur: () => void;
        error?: string;
    }) => ReactNode;
}

export function FormField<T extends FieldValues>({
    control,
    name,
    rules,
    label,
    helperText,
    required,
    className,
    children,
}: FormFieldProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Field
                    label={label}
                    error={error?.message}
                    helperText={helperText}
                    required={required}
                    className={className}
                >
                    {children({ value, onChange, onBlur, error: error?.message })}
                </Field>
            )}
        />
    );
}

// --- FormFieldInput (Controller + Input, ready to use) ---

export interface FormFieldInputProps<T extends FieldValues>
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'value' | 'onChange' | 'onBlur'> {
    control: Control<T>;
    name: FieldPath<T>;
    rules?: Omit<RegisterOptions<T, FieldPath<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    label?: string;
    helperText?: string;
    required?: boolean;
}

export function FormFieldInput<T extends FieldValues>({
    control,
    name,
    rules,
    label,
    helperText,
    required,
    className,
    ...inputProps
}: FormFieldInputProps<T>) {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = inputProps.type === "password";
    const resolvedType = isPasswordField ? (showPassword ? "text" : "password") : inputProps.type;

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Field
                    label={label}
                    error={error?.message}
                    helperText={helperText}
                    required={required}
                >
                    <div className="relative">
                        <Input
                            className={cn(
                                error && "border-destructive",
                                isPasswordField && "pr-10",
                                className,
                            )}
                            aria-invalid={error ? "true" : undefined}
                            value={(value ?? "").toString()}
                            onChange={onChange}
                            onBlur={onBlur}
                            {...inputProps}
                            type={resolvedType}
                        />
                        {isPasswordField && (
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                </Field>
            )}
        />
    );
}
