// import { HttpService } from "@nestjs/axios";
// import { Injectable } from "@nestjs/common";
// import { IPortal } from "src/modules/portal/interfaces/portal.interface";
// import { TelegramService } from "src/modules/telegram/telegram.service";
// import { BitrixApiQueueApiService } from "./bitrix-queue-api.service";

// export class BitrixApiFactoryService {

//   constructor(
//     private readonly telegram: TelegramService,
//     private readonly http: HttpService
//   ) { }

//   create(portal: IPortal): BitrixApiQueueApiService {
//     return new BitrixApiQueueApiService(portal, this.http, this.telegram);

//   }

// }
