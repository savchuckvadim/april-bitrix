import {
    ChartColumn,
    FileText,
    Filter,
    Globe,
    Inbox,
    PhoneCall,
    Sparkles,
    Workflow,
    type LucideIcon,
} from 'lucide-react';
import type { PlatformServiceSlug } from '../model/types';

/** Иконка сервиса: одна и та же в меню, карточках и на странице сервиса. */
export const SERVICE_ICONS: Record<PlatformServiceSlug, LucideIcon> = {
    calls: PhoneCall,
    documents: FileText,
    kpi: ChartColumn,
    ai: Sparkles,
    leads: Inbox,
    funnels: Filter,
    automation: Workflow,
    site: Globe,
};
