import { EV_CONTACT_PROP } from "../type/event-contact-type";

// const getEventContactsFromBX = (contacts: BXContact[]) => {

//     const resultContacts = contacts
//         .map(contact => {

//             const resultContact = {
//                 email: contact.EMAIL
//             } as EVContact
//         })

// }


export const validateInput = (value: string, nameForHandler: EV_CONTACT_PROP): string => {
    let isError = false
    let errorMessage = ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    if (nameForHandler === EV_CONTACT_PROP.EMAIL) {
        if (!emailRegex.test(value)) {
            isError = true
            errorMessage = 'Некорректный email';
        }
    } else if (nameForHandler === EV_CONTACT_PROP.PHONE) {
        if (!phoneRegex.test(value)) {
            isError = true
            errorMessage = 'Некорректный телефон';
        }
    }
    return errorMessage;
};

export const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
}