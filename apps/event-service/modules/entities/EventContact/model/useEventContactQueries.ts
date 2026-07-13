import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEventContact } from './useEventContact';
import { EV_CONTACT_TYPE } from '../type/event-contact-type';
import { PBXContactStateItem } from '../type/pbx-contact-type';
import { BXContact } from '@workspace/bx';
import { Bitrix } from '@workspace/bitrix';
import { Portal } from '@workspace/pbx';
import { getPbxContactByContact, getContactsRequestSelect } from '../util/pbx-contact-util';
import { chunkArray } from '../util/contact-util';

// API functions
const fetchContacts = async (portal: Portal, companyId: number): Promise<PBXContactStateItem[]> => {
    const contactsFrom = await Bitrix.getService().api.call(
        'crm.company.contact.items.get',
        { id: companyId },
    );

    const contactIds = contactsFrom.map((contact: any) => contact.CONTACT_ID);
    let contacts: BXContact[] = [];

    const select = getContactsRequestSelect();
    if (contactIds && contactIds.length) {
        const chunks = chunkArray<number>(contactIds, 50);
        const allContacts = [];
        for (const chunk of chunks) {
            const result = await Bitrix.getService().api.call(
                'crm.contact.list',
                {
                    filter: { 'ID': chunk },
                    select
                },
            ) as BXContact[];
            allContacts.push(...result);
        }
        contacts = allContacts;
    }

    return contacts.map(contact => getPbxContactByContact(portal, contact));
};

const createContact = async (
    portal: Portal,
    contact: Partial<PBXContactStateItem>,
    companyId: number,
    userId: number
): Promise<PBXContactStateItem> => {
    const fields = {
        ...contact,
        "PHONE": [{ "VALUE": contact.PHONE }],
        "EMAIL": [{ "VALUE": contact.EMAIL }],
        "ASSIGNED_BY_ID": userId,
        'COMPANY_ID': companyId
    };

    const contactId = await Bitrix.getService().api.call(
        'crm.contact.add',
        { fields },
    );

    const contactData = await Bitrix.getService().api.call(
        'crm.contact.get',
        { ID: contactId },
    );

    return getPbxContactByContact(portal, contactData);
};

// React Query hooks
export function useEventContactQueries(portal: Portal, companyId: number, userId: number) {
    const queryClient = useQueryClient();
    const { state, actions } = useEventContact();

    // Fetch contacts query
    const contactsQuery = useQuery({
        queryKey: ['contacts', companyId],
        queryFn: () => fetchContacts(portal, companyId),
        gcTime: 0,
        staleTime: 0,
        select: (data: PBXContactStateItem[]) => {
            actions.setFetchedContacts({ contacts: data });
            return data;
        }
    });

    // Create contact mutation
    const createContactMutation = useMutation({
        mutationFn: (contactData: Partial<PBXContactStateItem>) =>
            createContact(portal, contactData, companyId, userId),
        onSuccess: (data) => {
            actions.setCreatedContact(EV_CONTACT_TYPE.REPORT, data);
            queryClient.invalidateQueries({ queryKey: ['contacts', companyId] });
        },
    });

    // Combined actions
    const handleCreateContact = async (contactData: Partial<PBXContactStateItem>) => {
        actions.setCreatingContact({ isCreating: true, type: EV_CONTACT_TYPE.REPORT });
        try {
            await createContactMutation.mutateAsync(contactData);
        } finally {
            actions.setCreatingContact({ isCreating: false, type: null });
        }
    };

    return {
        // Queries
        contactsQuery,

        // Mutations
        createContactMutation,

        // Combined actions
        handleCreateContact,

        // Loading states
        isLoading: contactsQuery.isLoading,
        isCreating: createContactMutation.isPending,

        // Error states
        error: contactsQuery.error || createContactMutation.error,
    };
} 