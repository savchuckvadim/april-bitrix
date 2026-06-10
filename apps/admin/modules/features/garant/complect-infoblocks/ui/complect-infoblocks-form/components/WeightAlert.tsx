'use client';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface WeightAlertProps {
    totalWeight: number;
    complectWeight: number;
    weightMatches: boolean;
    weightDifference: number;
}

export function WeightAlert({
    totalWeight,
    complectWeight,
    weightMatches,
    weightDifference,
}: WeightAlertProps) {
    return (
        <Alert variant={weightMatches ? 'default' : 'destructive'}>
            {weightMatches ? (
                <CheckCircle2 className="h-4 w-4" />
            ) : (
                <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
                <div className="flex items-center justify-between">
                    <span>
                        {weightMatches
                            ? 'Вес выбранных инфоблоков соответствует весу комплекта'
                            : `Вес не соответствует! Выбрано: ${totalWeight.toFixed(2)}, требуется: ${complectWeight.toFixed(2)}`}
                    </span>
                    <span className="font-semibold">
                        {weightDifference > 0 ? '+' : ''}
                        {weightDifference.toFixed(2)}
                    </span>
                </div>
            </AlertDescription>
        </Alert>
    );
}
