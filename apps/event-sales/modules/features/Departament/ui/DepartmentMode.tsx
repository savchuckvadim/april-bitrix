'use client';

import { FC } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { DEPARTAMENT_STATE_PROP } from '../type/department-type';
import { switchDepartmentMode } from '../model/DepartmentThunk';

/** Тумблер режима ОП/ТМЦ (гейт withDepartmentModeToggle). */
export const DepartmentMode: FC = () => {
    const dispatch = useAppDispatch();
    const withToggle = useAppSelector(s => s.app.config.withDepartmentModeToggle);
    const mode = useAppSelector(
        s => s.department[DEPARTAMENT_STATE_PROP.MODE].current,
    );

    if (!withToggle || !mode) return null;

    const isTmc = mode.code === 'tmc';

    return (
        <div className="flex items-center gap-2">
            <Label htmlFor="dep-mode" className="text-xs text-muted-foreground">
                {mode.name}
            </Label>
            <Switch
                id="dep-mode"
                checked={isTmc}
                onCheckedChange={checked =>
                    dispatch(switchDepartmentMode(checked ? 1 : 0))
                }
            />
        </div>
    );
};
