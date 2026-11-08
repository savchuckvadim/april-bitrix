'use client';

import { toast } from 'sonner';
import { AButton } from '@workspace/april-ui';
import { CABINET_TEXT as TEXT } from '../../../consts/cabinet.const';
import type { CabinetPasswordLink } from '../../../model';

interface PasswordLinkNoticeProps {
    link: CabinetPasswordLink;
    onClose: () => void;
}

/**
 * Выпущенная ссылка на пароль. Почты у April пока нет — ссылку передают
 * вручную, поэтому она показывается целиком с кнопкой копирования.
 */
export const PasswordLinkNotice = ({ link, onClose }: PasswordLinkNoticeProps) => {
    const copy = () => {
        void navigator.clipboard
            .writeText(link.url)
            .then(() => toast.success(TEXT.linkCopied));
    };

    return (
        <div className="flex flex-col gap-2 rounded-md border border-dashed p-3">
            <p className="text-sm font-medium">{TEXT.linkTitle}</p>
            <p
                className={
                    link.emailSent
                        ? 'text-sm text-muted-foreground'
                        : 'text-sm text-destructive'
                }
            >
                {link.emailSent ? TEXT.linkEmailSent : TEXT.linkEmailNotSent}
            </p>
            <code className="break-all rounded bg-muted px-2 py-1 text-xs">
                {link.url}
            </code>
            <p className="text-xs text-muted-foreground">
                До {new Date(link.expiresAt).toLocaleString('ru-RU')}
            </p>
            <div className="flex gap-2">
                <div>
                    <AButton title={TEXT.linkCopy} size="small" clickHendler={copy} />
                </div>
                <div>
                    <AButton
                        title={TEXT.linkClose}
                        size="small"
                        color="grey"
                        clickHendler={onClose}
                    />
                </div>
            </div>
        </div>
    );
};
