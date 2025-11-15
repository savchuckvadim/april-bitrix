import { getBitrixSetupApp, getPortalKonstructor } from "@workspace/nest-api";
import { getBitrixAppClientApp } from "@workspace/nest-api/src/generated/bitrix-app-client-app/bitrix-app-client-app";

export const apiApp = getBitrixAppClientApp()
export const apiSetup = getBitrixSetupApp()
export const apiPortal = getPortalKonstructor()

// client api пока еще нету
