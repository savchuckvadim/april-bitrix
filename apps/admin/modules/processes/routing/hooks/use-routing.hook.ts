'use client';
import { useParams, usePathname } from "next/navigation";

import { resolveDeepRoute } from "../lib/resolve-deep-route";
import type { DeepRoute } from "../lib/resolve-deep-route";

/**
 * Флаги текущего раздела админки. Разбор адреса живёт в чистой
 * `resolveDeepRoute` — хук только подставляет путь и id портала из Next.
 */
export const useDeepRouting = (): DeepRoute => {
    const currentRoute = usePathname();
    const { portalId } = useParams<{ portalId: string }>();

    return resolveDeepRoute(currentRoute, portalId);
}
