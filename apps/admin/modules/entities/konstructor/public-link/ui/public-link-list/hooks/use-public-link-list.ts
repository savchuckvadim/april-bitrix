'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useCopyText } from '@/modules/entities/hooks/ui/hooks/use-copy-text';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import {
    usePublicLinks,
    useRevokeAllPublicLinks,
    useRevokePublicLink,
} from '../../../lib/hooks';
import { countActivePublicLinks, publicLinkUrl } from '../../../lib/public-link-view';
import type { PublicLink } from '../../../model';

/** Экран ссылок: список, копирование адреса, отзыв одной и всех с подтверждением. */
export const usePublicLinkList = () => {
    const linksQuery = usePublicLinks();
    const revokeLink = useRevokePublicLink();
    const revokeAllLinks = useRevokeAllPublicLinks();
    const { copiedText, copy } = useCopyText();

    const [isCreateOpen, setCreateOpen] = useState(false);
    const [linkToRevoke, setLinkToRevoke] = useState<PublicLink | null>(null);
    const [isRevokeAllOpen, setRevokeAllOpen] = useState(false);

    const links = linksQuery.data ?? [];

    const confirmRevoke = async () => {
        if (!linkToRevoke) return;
        try {
            await revokeLink.mutateAsync(linkToRevoke.id);
            toast.success('Ссылка отозвана');
            setLinkToRevoke(null);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Не удалось отозвать ссылку'));
        }
    };

    const confirmRevokeAll = async () => {
        try {
            const { revoked } = await revokeAllLinks.mutateAsync();
            toast.success(`Отозвано ссылок: ${revoked}`);
            setRevokeAllOpen(false);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Не удалось отозвать ссылки'));
        }
    };

    return {
        links,
        activeCount: countActivePublicLinks(links),
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
        isCopied: (link: PublicLink) => copiedText === publicLinkUrl(link.token),
        copyLink: (link: PublicLink) => void copy(publicLinkUrl(link.token)),
    };
};
