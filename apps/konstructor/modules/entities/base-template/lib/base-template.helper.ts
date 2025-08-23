import { API_METHOD, backAPI, EBACK_ENDPOINT } from "@workspace/api";
import {
  IBaseTemplate,
  IResponseBaseTemplate,
} from "../type/base-template.type";

export const getBaseTemplate = async (
  domain: string,
): Promise<{
  template: IBaseTemplate;
} | null> => {
  const response = await backAPI.service<IResponseBaseTemplate[]>(
    EBACK_ENDPOINT.BASE_TEMPLATE,
    API_METHOD.GET,
    {},
    domain,
  );

  const responseTemplate = response.data || null;

  if (responseTemplate) {
    const searched = responseTemplate.find((tmplt) => tmplt.code === "offer");
    const template = {
      id: searched?.id,
      letter:
        searched?.fields.find((fld) => fld.code === "letter")?.description ||
        "",
    } as IBaseTemplate;
    return { template };
  }
  return responseTemplate;
};
