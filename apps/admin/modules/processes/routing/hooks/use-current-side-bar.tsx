import { resolveSideBar } from "../lib/resolve-side-bar";
import type { SideBarView } from "../lib/resolve-side-bar";
import { useDeepRouting } from "./use-routing.hook";

/**
 * Пункты бокового меню текущего раздела. Вся раскладка — в чистой
 * `resolveSideBar`, хук только берёт флаги маршрута.
 */
export const useCurrentSideBar = (): SideBarView =>
    resolveSideBar(useDeepRouting());
