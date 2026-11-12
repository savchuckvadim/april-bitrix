'use client';

import { useState } from 'react';
import { AButton, AInput } from '@workspace/april-ui';
import { CABINET_TEXT as TEXT } from '../../../consts/cabinet.const';
import { useCreateCabinetClient } from '../../../lib/hooks/use-cabinet';
import { suggestOrganizationName } from '../../../lib/view/organization-name';

type Field = 'name' | 'email';

interface CabinetCreateClientFormProps {
    portalId: number;
    domain: string | null;
}

/**
 * «Создать организацию» для портала без клиента: название (черновик — по
 * домену) и email, если есть. Портал привязывается сразу.
 */
export const CabinetCreateClientForm = ({ portalId, domain }: CabinetCreateClientFormProps) => {
    const [form, setForm] = useState<Record<Field, string>>({
        name: suggestOrganizationName(domain),
        email: '',
    });
    const create = useCreateCabinetClient(portalId);
    const set = (name: Field, value: string) => setForm(prev => ({ ...prev, [name]: value }));
    const email = form.email.trim();
    const ready = form.name.trim().length > 0 && (!email || email.includes('@'));

    const field = (name: Field, label: string) => (
        <AInput<Field>
            label={label}
            errorMessage={null}
            nameForHandler={name}
            value={form[name]}
            handleChange={set}
            handleOnFocus={() => undefined}
        />
    );

    return (
        <div className="flex flex-col gap-2">
            <div className="grid gap-3 md:grid-cols-2">
                {field('name', TEXT.clientCreateName)}
                {field('email', TEXT.clientCreateEmail)}
            </div>
            <div className="w-56">
                <AButton
                    title={TEXT.clientCreate}
                    size="small"
                    isActive={ready && !create.isPending}
                    clickHendler={() => create.mutate({ name: form.name.trim(), email: email || null })}
                />
            </div>
        </div>
    );
};
