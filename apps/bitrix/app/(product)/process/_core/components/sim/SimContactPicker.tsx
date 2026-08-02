import type { FC } from 'react';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { SIM_CONTACTS } from '../../constants/sim-events';

interface SimContactPickerProps {
    id: string;
    label: string;
    hint: string;
    value: string | null;
    onChange: (contactId: string) => void;
}

/**
 * Выбор контакта. В форме таких блока ДВА и они независимы.
 *
 * Это не избыточность: разговор мог идти с секретарём, а встречу назначают с
 * директором. Один общий контакт на форму склеил бы две разные роли в одну и
 * сделал бы историю общения бесполезной.
 */
export const SimContactPicker: FC<SimContactPickerProps> = ({
    id,
    label,
    hint,
    value,
    onChange,
}) => (
    <div>
        <Label htmlFor={id} className="text-xs font-semibold">
            {label}
        </Label>
        <Select value={value ?? undefined} onValueChange={onChange}>
            <SelectTrigger id={id} className="mt-1.5 w-full cursor-pointer">
                <SelectValue placeholder="Выберите контакт" />
            </SelectTrigger>
            <SelectContent>
                {SIM_CONTACTS.map(contact => (
                    <SelectItem
                        key={contact.id}
                        value={contact.id}
                        className="cursor-pointer"
                    >
                        {contact.name}
                        <span className="text-muted-foreground">
                            {' · '}
                            {contact.role}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <p className="text-muted-foreground mt-1 text-[11px]">{hint}</p>
    </div>
);
