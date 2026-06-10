type SelectOption = { value: string; label: string };

type BtxDealFormField = {
    name: 'name' | 'title' | 'code' | 'portal_id';
    label: string;
    type: 'text' | 'number' | 'select';
    required: boolean;
    placeholder?: string;
    disabled?: boolean;
    options?: SelectOption[];
};

type GetBtxDealFormFieldsParams = {
    resolvedPortalId?: number;
    portalOptions: SelectOption[];
};

export const getBtxDealFormFields = ({
    resolvedPortalId,
    portalOptions,
}: GetBtxDealFormFieldsParams): BtxDealFormField[] => {
    const commonFields: BtxDealFormField[] = [
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
            name: 'code',
            label: 'Code',
            type: 'text',
            required: true,
            placeholder: 'Введите code',
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

