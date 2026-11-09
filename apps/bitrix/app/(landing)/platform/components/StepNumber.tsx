export interface StepNumberProps {
    value: number;
}

/** Номер шага в круге: общий для шагов сервиса и этапов запуска. */
export function StepNumber({ value }: StepNumberProps) {
    return (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-bold text-primary">
            {value}
        </span>
    );
}
