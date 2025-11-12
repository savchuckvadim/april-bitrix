export const getColorCompany = (color: string) => {

    return color ? `p-1 rounded-full bg-${color}-400 text-white border-${color}-700` : 'p-1 rounded-full  bg-gray-100 text-gray-800 border-secondary';
}
