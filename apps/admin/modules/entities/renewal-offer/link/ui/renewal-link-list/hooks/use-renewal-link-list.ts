'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCopyText } from '@/modules/entities/hooks/ui/hooks/use-copy-text';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import {
    useRenewalLinks,
    useRevokeAllRenewalLinks,
    useRevokeRenewalLink,
} from '../../../lib/hooks';
import {
    countActiveRenewalLinks,
    renewalLinkUrl,
} from '../../../lib/renewal-link-view';
import type { RenewalLink } from '../../../model';

/**
 * Экран предложений: список, копирование ссылки для отправки клиенту,
 * отзыв одной и всех с подтверждением.
 */
export const useRenewalLinkList = () => {
    const linksQuery = useRenewalLinks();
    const revokeLink = useRevokeRenewalLink();
    const revokeAllLinks = useRevokeAllRenewalLinks();
    const { copiedText, copy } = useCopyText();

    const [isCreateOpen, setCreateOpen] = useState(false);
    const [linkToRevoke, setLinkToRevoke] = useState<RenewalLink | null>(null);
    const [isRevokeAllOpen, setRevokeAllOpen] = useState(false);

    const links = linksQuery.data ?? [];

    const confirmRevoke = async () => {
        if (!linkToRevoke) return;
        try {
            await revokeLink.mutateAsync(linkToRevoke.id);
            toast.success('Предложение отозвано');
            setLinkToRevoke(null);
        } catch (error) {
            toast.error(
                getApiErrorMessage(error, 'Не удалось отозвать предложение'),
            );
        }
    };

    const confirmRevokeAll = async () => {
        try {
            const { revoked } = await revokeAllLinks.mutateAsync();
            toast.success(`Отозвано предложений: ${revoked}`);
            setRevokeAllOpen(false);
        } catch (error) {
            toast.error(
                getApiErrorMessage(error, 'Не удалось отозвать предложения'),
            );
        }
    };

    return {
        links,
        activeCount: countActiveRenewalLinks(links),
        isLoading: linksQuery.isLoading,
        isError: linksQuery.isError,
        isCreateOpen,
        setCreateOpen,
        linkToRevoke,
        setLinkToRevoke,
        isRevoking: revokeLink.isPending,
        confirmRevoke,
        isRevokeAllOpen,
        setRevokeAllOpen,
        isRevokingAll: revokeAllLinks.isPending,
        confirmRevokeAll,
        isCopied: (link: RenewalLink) =>
            copiedText === renewalLinkUrl(link.token),
        copyLink: (link: RenewalLink) => void copy(renewalLinkUrl(link.token)),
    };
};
