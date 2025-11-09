import { parseISO, format, addDays } from "date-fns";

export const getUserReportDate = (from: string, to: string) => {
    const dateFrom = parseISO(from);
    // const dateTo = parseISO(to);
    const dateTo = addDays(parseISO(to), 1); // добавляем 1 день

    const result = {
        dateFrom: format(dateFrom, "dd.MM.yyyy"),
        dateTo: format(dateTo, "dd.MM.yyyy"),
    };
    return result;
}
