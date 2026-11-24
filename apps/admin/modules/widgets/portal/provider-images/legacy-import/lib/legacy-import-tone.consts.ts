import type { ProviderImageLegacyTone } from '@/modules/entities/portal-provider/provider-image';

/** Окраска плашки статуса по токенам темы. */
export const LEGACY_IMPORT_TONE_CLASS: Readonly<Record<ProviderImageLegacyTone, string>> = {
    success: 'border-success/50 bg-success/10 text-success',
    info: 'border-primary/40 bg-primary/10 text-primary',
    warning: 'border-warning/60 bg-warning/10 text-foreground',
    muted: 'border-border bg-muted text-muted-foreground',
    danger: 'border-destructive/50 bg-destructive/10 text-destructive',
};
