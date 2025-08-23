import { API_METHOD, onlineGeneralAPI } from "@workspace/api";
import { IFilterResponse } from "../../types/report/report-type";

export const getFilter = async (
  domain: string,
  userId: number,
): Promise<IFilterResponse | null> => {
  return (await onlineGeneralAPI.service(
    "report/settings/get/filter",
    API_METHOD.POST,
    "result",
    { domain, userId },
  )) as IFilterResponse | null;
};

export const saveFilterToServer = async (
  domain: string,
  userId: number,
  filter: any,
  dates: any,
  department: any,
) => {
  const jsonFilter = JSON.stringify(filter, null, "  ");
  const jsonDates = JSON.stringify(dates, null, "  ");
  const jsonDepartment = JSON.stringify(department, null, "  ");

  return await onlineGeneralAPI.service(
    "report/settings/filter",
    API_METHOD.POST,
    "filter",
    {
      domain,
      userId,
      filter: {
        actions: jsonFilter,
        dates: jsonDates,
        department: jsonDepartment,
      },
    },
  );
};
