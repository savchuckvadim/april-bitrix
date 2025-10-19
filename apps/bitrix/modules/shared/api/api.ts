import { getBitrixSetupApp, getPortalKonstructor } from "@workspace/nest-api";
import { getBitrixAppClient } from "@workspace/nest-api/src/generated/bitrix-app-client/bitrix-app-client";

export const apiApp = getBitrixAppClient()
export const apiSetup = getBitrixSetupApp()
export const apiPortal = getPortalKonstructor()

// client api пока еще нету
