// import { AppFrame, AuthManager, MessageManager, PlacementManager } from "@bitrix24/b24jssdk"
// import { type TypeB24 } from '@bitrix24/b24jssdk'

import {
  // LoggerBrowser,

  Result,
  EnumCrmEntityTypeId,
  AuthData,
} from "@bitrix24/b24jssdk";
import { initializeB24Frame } from "@bitrix24/b24jssdk";
import { getLayout } from "./bx-helper/activity-helper";
import { BXUser, CustomPlacement, Placement } from "@workspace/bx";
import { PlacementPlace } from "@workspace/bx/src/type/placement-type";
import { hookAPI } from "./april-hook-api";
import { API_METHOD } from "../type/type";

type B24 = Awaited<ReturnType<typeof initializeB24Frame>>;

export class BxService {
  private b24: B24;

  private constructor(b24Instance: B24) {
    this.b24 = b24Instance;
  }

  static async create(): Promise<BxService> {
    const b24 = await initializeB24Frame();
    return new BxService(b24);
  }

  public getB24(): B24 {
    return this.b24;
  }
}

// Синглтон — объект класса BxService
let bxSingleton: BxService | null = null;

// Экспортируемый метод для получения оригинального b24
export async function getBxService(): Promise<B24> {
  if (!bxSingleton) {
    bxSingleton = await BxService.create();
  }
  return bxSingleton.getB24();
}

export const bxAPI = {
  install: async () => {
    const b24 = await getBxService();
    await b24.installFinish();
  },
  method: () => {
    //    const manager = new PlacementManager()
    // const bx = B24Frame
    // const result = await callMethod()
  },
  getPlacement: async (): Promise<Placement | CustomPlacement> => {
    const b24 = await getBxService();
    return {
      options: b24.placement.options,
      placement: b24.placement.title as PlacementPlace,
    };
  },
  getFit: async () => {
    const b24 = await getBxService();
    return await b24.parent.fitWindow();
  },
  getDomain: async () => {
    const b24 = await getBxService();
    const authData = b24.auth.getAuthData() as false | AuthData;
    // Проверка, чтобы не упасть, если authData = false
    console.log("authData");
    console.log(authData);
    if (!authData) return null;
    const domain = authData.domain;
    const hostname = new URL(domain).hostname;
    console.log("hostname");
    console.log(hostname);
    return hostname;
  },
  getCurrentUser: async () => {
    const b24 = await getBxService();
    let currentUser = null as null | BXUser;
    try {
      const currentUserData = await b24.callMethod("user.current");
      if (currentUserData) {
        if (currentUserData.isSuccess) {
          currentUser = currentUserData.getData().result as unknown as BXUser;
        }
      }
      return currentUser;
    } catch (error) {
      console.log(error);
      return currentUser;
    }
  },
  getProtectedMethod: async (
    method: string,
    data: object,
    domain: string = "",
    inBitrix: boolean = false,
  ) => {
    const b24 = await getBxService();
    let result = null;
    let response = null;
    try {
      if (inBitrix) {
        response = await b24.callMethod(method, data);
      } else {
        const bxReqHookData = {
          domain,
          method,
          bxData: data,
        };
        result = await hookAPI.service(
          "bitrix/method",
          API_METHOD.POST,
          "result",
          bxReqHookData,
        );
      }
      if (response) {
        result = response;
      }

      return result;
    } catch (error) {
      console.log("error");
      console.log(response);
      console.log(error);

      return result;
    }
  },
  saleInit: async (dealId: null | number, companyId: null | number) => {
    const b24 = await getBxService();

    const placement = b24.placement;
    console.log("b24test plcmnt");
    console.log(placement);
    const authData = b24.auth.getAuthData();

    try {
      const result = (await b24.callBatch({
        CompanyList: {
          method: "crm.item.list",
          params: {
            entityTypeId: EnumCrmEntityTypeId.company,
            order: { id: "desc" },
            select: ["id", "title", "createdTime"],
          },
        },
        DealList: {
          method: "crm.deal.list",
          params: {
            order: { created: "desc" },
            select: [
              "id",
              "title",
              "createdTime",
              "UF_CRM_1586947711880", // UF_CRM_1586947711880 - field with date
            ],
          },
        },
        UserList: {
          method: "user.current.get",
          params: {},
        },
      })) as Result;
      console.log("b24test result");
      console.log(result);

      console.log("b24test result");
      // console.log(result.getData())
      // logger.info('result >> ', result)

      return result;
    } catch (error) {
      console.log("b24test error");
      console.log(error);
    }
  },

  setActivity: async (
    companyId: number,
    report: any,
    description: string,
    responsibilityId: number,
    planEvent: { code: string; name: string; description: string },
    deadline: string,
    color: string,
  ) => {
    const b24 = await getBxService();
    // const authData = b24.auth.getAuthData()
    // console.log(authData)

    let result = null;
    let dealResponse = null;
    const fields = {
      // "RESPOSIBLE_ID": responsibilityId || 1,
      // "DEADLINE": deadline
      responsibleId: responsibilityId || 1,
      deadline: deadline,
      completed: "N",
      pingOffset: [0, 5, 15, 30, 60],
      // "badgeCode": "myCustomBadge"  // сначала зарегистрировать на портал е badge
    };
    let eventType = planEvent.code || "Звонок";

    let title = planEvent.name;

    // if (!isPlanned && currentTask) {
    //     title = currentTask.title
    // }
    const layout = getLayout(
      companyId,
      "",
      title,
      description,
      eventType,
      deadline,
      color,
    );

    // https://dev.1c-bitrix.ru/rest_help/crm/rest_activity/configurable/structure/actiondto.php

    const data = {
      ownerTypeId: 4,
      ownerId: companyId,
      fields,
      layout,
    };

    try {
      dealResponse = await b24.callMethod(
        "crm.activity.configurable.add",
        data,
      );
      // console.log('setActivity')
      // console.log('dealResponse')

      if (dealResponse) {
        result = dealResponse.getData();
        console.info(result);

        const selectedUser = await b24.dialog.selectUser();
        console.info(selectedUser);
      }
      return result;
    } catch (error) {
      console.log("error");
      console.log(dealResponse);
      console.log(error);
      return result;
    }
  },

  // auth: () => {
  //     AuthManager.getAuth()
  // },
};
