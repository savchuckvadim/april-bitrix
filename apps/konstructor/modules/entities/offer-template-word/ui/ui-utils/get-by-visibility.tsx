import { Building2Icon, CatIcon, CircleIcon, EarthIcon } from "lucide-react";
import { WordTemplateVisibility } from "../../types";

/** Tailwind extras for shadcn `Badge` when variant alone is not enough */
export const getVisibilityBadgeClassName = (visibility: string): string => {
    const s = String(visibility).toLowerCase();
    if (s === WordTemplateVisibility.PUBLIC || s === "public") {
        return "border-emerald-500/35 bg-emerald-500/12 text-emerald-950 dark:text-emerald-50";
    }
    if (s === WordTemplateVisibility.PORTAL || s === "portal" || s === "private") {
        return "border-sky-500/35 bg-sky-500/12 text-sky-950 dark:text-sky-50";
    }
    return "border-violet-500/35 bg-violet-500/12 text-violet-950 dark:text-violet-50";
};

export const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
        case WordTemplateVisibility.PUBLIC:
        case "public":
            return "Общедоступный";
        case WordTemplateVisibility.PORTAL:
        case "private":
            return "Компании";
        case WordTemplateVisibility.USER:
        case "user":
            return "Мой";
        default:
            return visibility;
    }
};

export const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
        case WordTemplateVisibility.PUBLIC:
        case "public":
            return "success";
        case WordTemplateVisibility.PORTAL:
        case "portal":
            return "primary";
        case WordTemplateVisibility.USER:
        case "user":
            return "violet";
        default:
            return "default";
    }
};

/** Shadcn `Badge` variant */
export const getVisibilityBadgeVariant = (
    visibility: string,
): "default" | "secondary" | "outline" | "destructive" => {
    const s = String(visibility).toLowerCase();
    if (s === WordTemplateVisibility.PUBLIC || s === "public") return "default";
    if (s === WordTemplateVisibility.PORTAL || s === "portal" || s === "private") return "secondary";
    return "outline";
};

export const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
        case WordTemplateVisibility.PUBLIC:
        case "public":
            return <EarthIcon size={14} />;
        case WordTemplateVisibility.PORTAL:
        case "portal":
            return <Building2Icon size={14} />;
        case WordTemplateVisibility.USER:
        case "user":
            return <CatIcon size={14} />;
        default:
            return <CircleIcon size={14} />;
    }
};