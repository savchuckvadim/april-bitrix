type SelectOption = { value: string; label: string };

type SmartFormField = {
    name: 'name' | 'title' | 'type' | 'group' | 'entityTypeId' | 'portal_id';
    label: string;
    type: 'text' | 'number' | 'select';
    required: boolean;
    placeholder?: string;
    disabled?: boolean;
    options?: SelectOption[];
};

type GetSmartFormFieldsParams = {
    resolvedPortalId?: number;
    portalOptions: SelectOption[];
};

export const getSmartFormFields = ({
    resolvedPortalId,
    portalOptions,
}: GetSmartFormFieldsParams): SmartFormField[] => {
    const commonFields: SmartFormField[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'Введите name',
        },
        {
            name: 'title',
            label: 'Title',
            type: 'text',
            required: true,
            placeholder: 'Введите title',
        },
        {
            name: 'type',
            label: 'Type',
            type: 'text',
            required: true,
            placeholder: 'Введите type',
        },
        {
            name: 'group',
            label: 'Group',
            type: 'text',
            required: true,
            placeholder: 'Введите group',
        },
        {
            name: 'entityTypeId',
            label: 'Entity Type ID',
            type: 'number',
            required: true,
            placeholder: 'Введите Entity Type ID',
        },
    ];

    if (resolvedPortalId) {
        return [
            ...commonFields,
            {
                name: 'portal_id',
                label: 'Portal ID',
                type: 'number',
                required: true,
                disabled: true,
            },
        ];
    }

    return [
        ...commonFields,
        {
            name: 'portal_id',
            label: 'Portal',
            type: 'select',
            required: true,
            placeholder: 'Выберите портал',
            options: portalOptions,
        },
    ];
};
